import React from "react";
import { getServices } from "../../../lib/forms/overview";
import { CraigFormHeading } from "../../forms/utils/ToggleFormComponents";
import {
  GroupResource,
  IbmCloudKeyProtect,
  ObjectStorage,
  IbmCloudSecretsManager,
  IbmCloudEventStreams,
  CloudApp,
  IbmDb2,
  DnsServices,
  IbmCloudLogging,
  IbmCloudSysdigSecure,
  CloudMonitoring,
} from "@carbon/icons-react";
import { IcseFormGroup } from "icse-react-assets";
import { CraigEmptyResourceTile } from "../../forms/dynamic-form";
import { ManageService } from "./ManageService";
import PropTypes from "prop-types";
import "./diagrams.css";

const serviceFormMap = {
  key_management: {
    icon: IbmCloudKeyProtect,
  },
  object_storage: {
    icon: ObjectStorage,
  },
  secrets_manager: {
    icon: IbmCloudSecretsManager,
  },
  event_streams: {
    icon: IbmCloudEventStreams,
  },
  appid: {
    icon: CloudApp,
  },
  icd: {
    icon: IbmDb2,
  },
  dns: {
    icon: DnsServices,
  },
  logdna: {
    icon: IbmCloudLogging,
  },
  sysdig: {
    icon: IbmCloudSysdigSecure,
  },
  atracker: {
    icon: CloudMonitoring,
  },
};

export const RgServiceMap = (props) => {
  let services = getServices(props.craig, props.services);
  return services.serviceResourceGroups.map((rg, rgIndex) => {
    let serviceMap = services.serviceMap[rg];
    return (
      <div className="subForm marginBottomSmall serviceBox" key={rg}>
        <CraigFormHeading
          icon={<GroupResource className="diagramTitleIcon" />}
          name={rg}
          type="subHeading"
          buttons={props.buttons ? props.buttons(rg) : undefined}
        />
        <IcseFormGroup className="overrideGap">
          {serviceMap.length === 0 ? (
            <CraigEmptyResourceTile
              name="services in this resource group"
              noClick
            />
          ) : (
            serviceMap
              .sort((a, b) => {
                // sort resources by name within the same resource type
                if ((a.overrideType || a.type) < (b.overrideType || b.type))
                  return -1;
                if ((a.overrideType || a.type) > (b.overrideType || b.type))
                  return 1;
                if (a.name < b.name && a.type === b.type) return -1;
                if (a.name > b.name && a.type === b.type) return 1;
              })
              .map((service) => {
                return (
                  <ManageService
                    key={JSON.stringify(service)}
                    resourceGroup={rg}
                    service={service}
                    icon={serviceFormMap[service.type].icon}
                    className="pointerEventsNone"
                  />
                );
              })
          )}
        </IcseFormGroup>
      </div>
    );
  });
};

RgServiceMap.propTypes = {
  craig: PropTypes.shape({}).isRequired,
  services: PropTypes.arrayOf(PropTypes.string).isRequired,
  buttons: PropTypes.func,
};
