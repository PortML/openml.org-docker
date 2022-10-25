import axios from 'axios';
import React from "react";
import styled from "styled-components";
import { MainContext } from "../../App.js";
import { FeatureDetail, QualityDetail } from "./ItemDetail.js";
import { CollapsibleDataTable } from "./sizeLimiter.js";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  Avatar,
  Card,
  CardContent, Chip, Grid,
  IconButton,
  Tooltip, Typography
} from "@mui/material";
import ReactMarkdown from "react-markdown";
import { MetaTag } from "./MetaItems";

const UserChip = styled(Chip)`
  margin-bottom: 5px;
`;

const ActionButton = styled(IconButton)`
  float: right;
  border-radius: 0;
`;

const Action = styled.div`
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`;

const SERVER_URL = process.env.REACT_APP_PHP_URL || "https://www.openml.org/";

const downloadMetaData = async (dataUrl) => {
  try {
    const yourConfig = {
      headers: {
        Authorization: "Bearer " + localStorage.getItem("token")
      }
    }
    //Get API key
    let apiKeyResponse = await axios.get(process.env.REACT_APP_SERVER_URL + "api-key", yourConfig)
    let apiKey = apiKeyResponse.data.apikey
    if (apiKey === undefined || apiKey === null) throw new Error("No Api Key")

    //Download data with apiKey as headers is not possible with HTTP redirect
    window.open(`${SERVER_URL}${dataUrl}?api_key=${apiKey}`)

  } catch (error) {
    console.error(error)
  }
}

const downloadDataset = async (originalUrl, name) => {
  try {
    const yourConfig = {
      headers: {
        Authorization: "Bearer " + localStorage.getItem("token")
      }
    }
    //Get API key
    let apiKeyResponse = await axios.get(process.env.REACT_APP_SERVER_URL + "api-key", yourConfig)
    let apiKey = apiKeyResponse.data.apikey
    if (apiKey === undefined || apiKey === null) throw new Error("No Api Key")

    const { pathname } = new URL(originalUrl)

    //Download data with apiKey as headers is not possible with HTTP redirect
    //Path adds a extra slash that is present on the server URL Therefoe slice is used to remove this
    // window.open(`${SERVER_URL.slice(0, -1)}${pathname}?api_key=${apiKey}`)

    let link = document.createElement("a")
    link.download = name || "Download"
    link.href = `${SERVER_URL.slice(0, -1)}${pathname}?api_key=${apiKey}` //Path adds a extra slash that is present on the server URL Therefoe slice is used to remove this
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

  } catch (error) {
    console.error(error)
  }
}

export class DatasetItem extends React.Component {
  constructor() {
    super();
    this.defaultFeatureListSizeLimit = 7;
    this.featureSizeLimit = this.defaultFeatureListSizeLimit;
  }

  render() {
    let featureTableColumns = [
      "",
      "Feature Name",
      "Type",
      "Distinct/Missing Values"
    ];
    let qualityTableColumns = ["", "Quality Name", "Value"];
    return (
      <MainContext.Consumer>
        {context => (
          <React.Fragment>
            {(process.env.REACT_APP_AUTHNETICATION_REQUIRED !== 'true' || context.loggedIn === true)}
            {(process.env.REACT_APP_AUTHNETICATION_REQUIRED !== 'true' || context.loggedIn === true) &&
              <Grid container spacing={6}>
                <Grid item xs={12}>
                  <MainContext.Consumer>
                    {context => (
                      <React.Fragment>
                        <Tooltip title="Download XML description" placement="bottom-start">
                          <ActionButton color="primary" onClick={() => downloadMetaData(`api/v1/data/${this.props.object.data_id}`)}>
                            <Action>
                              <FontAwesomeIcon icon="file-alt" />
                              <Typography>xml</Typography>
                            </Action>
                          </ActionButton>
                        </Tooltip>
                        <Tooltip title="Download JSON description" placement="bottom-start">
                          <ActionButton color="primary" onClick={() => downloadMetaData(`api/v1/json/data/${this.props.object.data_id}`)}>
                            <Action>
                              <FontAwesomeIcon icon="file-alt" />
                              <Typography>json</Typography>
                            </Action>
                          </ActionButton>
                        </Tooltip>
                        {(process.env.REACT_APP_AUTHNETICATION_REQUIRED !== 'true' || context.loggedIn === true)}
                        <Tooltip title="Edit dataset (requires login)" placement="bottom-start">
                          <ActionButton color={context.loggedIn ? "primary" : "default"} href={context.loggedIn ? "auth/data-edit?id=" + this.props.object.data_id : "auth/sign-in"}>
                            <Action>
                              <FontAwesomeIcon icon="edit" />
                              <Typography>edit</Typography>
                            </Action>
                          </ActionButton>
                        </Tooltip>
                        <Tooltip title="Download dataset" placement="bottom-start">
                          <ActionButton color="primary" onClick={() => downloadDataset(this.props.object.url, `${this.props.object.name}.${this.props.object.format}`)}>
                            <Action>
                              <FontAwesomeIcon icon="cloud-download-alt" />
                              <Typography>download</Typography>
                            </Action>
                          </ActionButton>
                        </Tooltip>
                      </React.Fragment>
                    )}
                  </MainContext.Consumer>
                  <Grid container>
                    <Grid item md={12}>
                      <Typography variant="h1" style={{ marginBottom: "15px" }}>
                        <FontAwesomeIcon icon="database" />
                        &nbsp;&nbsp;&nbsp;{this.props.object.name}
                      </Typography>
                    </Grid>
                    <Grid item md={12}>
                      <MetaTag type={"id"} value={"ID: " + this.props.object.data_id} />
                      <MetaTag type={"status"} value={this.props.object.status === 'active' ? 'verified' : this.props.object.status}
                        color={this.props.object.status === 'active' ? 'green' : (this.props.object.status === 'deactivated' ? 'red' : 'orange')} />
                      <MetaTag type={"format"} value={this.props.object.format} />
                      <MetaTag type={"licence"} value={this.props.object.licence} />
                      <FontAwesomeIcon icon="clock" />{" "}
                      {this.props.object.date.split(" ")[0]}
                      <br />
                      <UserChip
                        size="small"
                        variant="outlined"
                        color="primary"
                        avatar={
                          <Avatar>{this.props.object.uploader ? this.props.object.uploader.charAt(0) : "X"}</Avatar>
                        }
                        label={this.props.object.uploader}
                        href={"search?type=user&id=" + this.props.object.uploader_id}
                        component="a"
                        clickable
                      />{" "}
                      <MetaTag type={"likes"} value={this.props.object.nr_of_likes + " likes"} />
                      <MetaTag
                        type={"issues"}
                        value={this.props.object.nr_of_issues + " issues"}
                      />
                      <MetaTag
                        type={"downloads"}
                        value={this.props.object.nr_of_downloads}
                      />
                    </Grid>
                  </Grid>

                  <Grid container>
                    <Grid item md={12}>
                      <FontAwesomeIcon icon="tags" /> {this.props.tags}
                    </Grid>
                  </Grid>
                </Grid>

                <Grid item xs={12}>
                  <Card>
                    <CardContent>
                      <Typography variant="h4" mb={6}>
                        Description
                      </Typography>
                      <div className="contentSection">
                        <ReactMarkdown children={this.props.object.description} />
                      </div>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12}>
                  <Card>
                    <CardContent>
                      <CollapsibleDataTable
                        title={this.props.object.features.length + " Features"}
                        columns={featureTableColumns}
                        data={this.props.object.features}
                        rowrenderer={m => (
                          <FeatureDetail
                            key={"fd_" + m.name}
                            item={m}
                            type={m.type}
                          ></FeatureDetail>
                        )}
                        maxLength={7}
                      />
                    </CardContent>
                  </Card>
                </Grid>

                <Grid item xs={12}>
                  <Card>
                    <CardContent>
                      <CollapsibleDataTable
                        title={
                          Object.keys(this.props.object.qualities).length +
                          " Qualities"
                        }
                        data={Object.keys(this.props.object.qualities)}
                        rowrenderer={m => (
                          <QualityDetail
                            key={"q_" + m}
                            item={{ name: m, value: this.props.object.qualities[m] }}
                          />
                        )}
                        columns={qualityTableColumns}
                        maxLength={7}
                      />
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            }
          </React.Fragment>
        )}
      </MainContext.Consumer>
    );
  }
}
