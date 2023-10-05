import React from "react";
import {
  IcseFormGroup,
  IcseNameInput,
  IcseTextInput,
  IcseModal,
  IcseSelect,
  IcseToggle,
} from "icse-react-assets";
import {
  invalidProjectName,
  invalidProjectDescription,
  invalidProjectNameText,
} from "../../../lib";
import { invalidNewResourceName } from "../../../lib/forms";
import { azsort, isNullOrEmptyString } from "lazy-z";
import { Launch } from "@carbon/icons-react";
import { Button } from "@carbon/react";
import { TemplateAbout } from "../../forms/OptionsForm";
import MixedPattern from "../../../images/mixed.png";
import VsiPattern from "../../../images/VsiPattern.png";
import VsiEdgePattern from "../../../images/VsiEdgePattern.png";
import PowerSAP_HanaPattern from "../../../images/PowerSAP_HanaPattern.png";

const constants = require("../../../lib/constants");
const templateImages = {
  Mixed: MixedPattern,
  VSI: VsiPattern,
  "VSI Edge": VsiEdgePattern,
  "Power VS SAP Hana": PowerSAP_HanaPattern,
};

constants.templates.forEach((template) => {
  constants.template_dropdown_map[template].image = templateImages[template];
});

export class ProjectFormModal extends React.Component {
  constructor(props) {
    super(props);

    if (this.props.data) {
      this.state = { ...this.props.data };
    }

    this.handleTextInput = this.handleTextInput.bind(this);
    this.handleToggle = this.handleToggle.bind(this);
  }

  handleTextInput(event) {
    let { name, value } = event.target;
    this.setState({ [name]: value });
  }

  handleToggle(name) {
    this.setState({ [name]: !this.state[name] });
  }

  render() {
    let invalidProjectNameVal = invalidProjectName(this.state, this.props);
    let invalidDescription = invalidProjectDescription(this.state.description);
    let invalidSchematicsName = this.state.use_schematics
      ? invalidNewResourceName(this.state.workspace_name)
      : false;

    return (
      <IcseModal
        size={this.state.use_template ? "lg" : "md"}
        open={this.props.open}
        heading={
          this.state.last_save === undefined
            ? "Create a New Project"
            : "Edit Project Details"
        }
        primaryButtonText={
          this.state.last_save === undefined
            ? "Create Project"
            : "Save Project" + (this.state.use_schematics ? " & Workspace" : "")
        }
        onRequestClose={this.props.onClose}
        onRequestSubmit={() => {
          this.props.onSubmit(
            this.state,
            this.props,
            this.props.setCurrentProject
          );
          this.props.onClose();

          if (this.props.nav !== undefined) {
            this.props.nav("/projects");
          }
        }}
        primaryButtonDisabled={
          invalidProjectNameVal || invalidDescription || invalidSchematicsName
        }
      >
        <IcseFormGroup>
          <IcseNameInput
            invalid={invalidProjectNameVal}
            invalidText={invalidProjectNameText(this.state, this.props)}
            id="project-name"
            componentName="project"
            value={this.state.name || ""}
            onChange={this.handleTextInput}
            helperTextCallback={() => {
              return this.state.last_save
                ? "Last Saved: " +
                    new Date(this.state.last_save).toLocaleString()
                : "";
            }}
          />
        </IcseFormGroup>
        <IcseFormGroup>
          <IcseTextInput
            invalid={invalidDescription}
            invalidText={
              "Project description must follow the regex pattern: " +
              constants.projectDescriptionRegex
            }
            componentName="project"
            field="description"
            placeholder="Brief project description"
            id="project-description"
            onChange={this.handleTextInput}
            value={this.state.description || ""}
            className="textInputWide"
            optional={true}
          />
        </IcseFormGroup>
        <IcseFormGroup>
          <IcseToggle
            labelText="Use a Project Template"
            defaultToggled={this.state.use_template}
            disabled={
              this.props.data.use_template &&
              !isNullOrEmptyString(this.props.data.last_save) &&
              !isNullOrEmptyString(this.props.data.template)
            } // do not allow removal of template once saved with template
            onToggle={() => this.handleToggle("use_template")}
            id="use-template"
            toggleFieldName="use_template"
            value={this.state.use_template}
            tooltip={{
              content:
                "Create a new project based on a preconfigured quick start template",
            }}
          />
        </IcseFormGroup>
        {this.state.use_template && (
          <div className="marginBottom formInSubForm">
            <IcseFormGroup noMarginBottom>
              <IcseSelect
                name="template"
                formName="project"
                labelText="Select a Project Template"
                groups={this.props.templates}
                value={this.state.template || "Mixed"}
                handleInputChange={this.handleTextInput}
                disabled={
                  this.props.data.use_template &&
                  !isNullOrEmptyString(this.props.data.last_save) &&
                  !isNullOrEmptyString(this.props.data.template)
                } // do not allow removal of template once saved with template
              />
              <TemplateAbout
                smallImage
                template={
                  constants.template_dropdown_map[
                    this.state.template || "Mixed"
                  ]
                }
              />
            </IcseFormGroup>
          </div>
        )}
        <>
          <IcseFormGroup>
            <IcseToggle
              labelText="Integrate with Schematics"
              defaultToggled={this.state.use_schematics}
              onToggle={() => this.handleToggle("use_schematics")}
              id="use-schematics"
              toggleFieldName="use_schematics"
              value={this.state.use_schematics}
            />
          </IcseFormGroup>
          {this.state.use_schematics && (
            <div className="formInSubForm">
              <IcseFormGroup>
                <IcseTextInput
                  invalid={invalidNewResourceName(this.state.workspace_name)}
                  invalidText={"Invalid Name"}
                  componentName="workspace"
                  field="workspace_name"
                  id="workspace-name"
                  onChange={this.handleTextInput}
                  value={this.state.workspace_name || ""}
                />
              </IcseFormGroup>
              <IcseFormGroup>
                <IcseTextInput
                  invalid={false}
                  componentName="workspace"
                  field="workspace_resource_group"
                  id="workspace-resource-group"
                  onChange={this.handleTextInput}
                  value={this.state.workspace_resource_group}
                  placeholder={"default"}
                  optional={true}
                  tooltip={{
                    content: `Must correspond to an existing resource group. If not provided, the workspace will be deployed to the "default" resource group in the account.`,
                    link: "https://cloud.ibm.com/docs/account?topic=account-rgs&interface=ui",
                  }}
                />
              </IcseFormGroup>
              <IcseFormGroup>
                <IcseSelect
                  name="workspace_region"
                  labelText={"Workspace Region"}
                  formName={"projects"}
                  value={this.state.workspace_region || "us-south"}
                  groups={["us-south", "eu-de", "eu-gb"].sort(azsort)}
                  handleInputChange={this.handleTextInput}
                />
              </IcseFormGroup>
              {this.state.workspace_url && (
                <div className="displayFlex alignItemsEnd">
                  <IcseTextInput
                    invalid={false}
                    readOnly={true}
                    componentName="project"
                    field="workspace_url"
                    id="workspace-url"
                    value={this.state.workspace_url || ""}
                    className="textInputWide marginRightSmall"
                  />
                  <Button
                    kind="ghost"
                    onClick={() => {
                      window.open(this.state.workspace_url, "_blank");
                    }}
                    renderIcon={Launch}
                    iconDescription="Launch workspace in new tab"
                  ></Button>
                </div>
              )}
            </div>
          )}
        </>
      </IcseModal>
    );
  }
}
