import { FC, useEffect, useState } from "react";
import { useClientContext } from "../../providers/ClientProvider";
import { OPENTALK_EVENT_ID } from "../../constants";
import Button from "@mui/material/Button";
import { DeleteEventQueryParams } from "../../api/types/events";
import Container from "./container";
import { Box, Stack, Typography } from "@mui/material";

const EventEditPage: FC = () => {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [customProps, setCustomProps] = useState<Office.CustomProperties>(null);
  const [showDisclaimer, setShowDisclaimer] = useState(false);

  useEffect(() => {
    Office.context.mailbox.item.loadCustomPropertiesAsync((result) => {
      const customProps = result.value;
      setCustomProps(customProps);
      setIsLoading(false);
    });
  }, []);

  const client = useClientContext().client;

  const handleCancel = async () => {
    const params: DeleteEventQueryParams = {
      forceDeleteReferenceIfExternalServicesFail: false,
      suppressEmailNotification: true,
    };
    const eventId = customProps.get(OPENTALK_EVENT_ID);
    await client.delete(`events/${eventId}`, undefined, params);
    customProps.remove(OPENTALK_EVENT_ID);
    customProps.saveAsync(() => setShowDisclaimer(true));
  };

  return (
    <Container>
      {isLoading && <Typography>Loading...</Typography>}{" "}
      {showDisclaimer && (
        <Stack>
          <Typography>Meeting successfully cancelled.</Typography>
          <Typography component="div">
            <Box sx={{ fontWeight: "bold", display: "inline" }}>Important</Box>
            <Box sx={{ fontWeight: "regular", display: "inline" }}>
              : You will have to manually cancel it in Outlook.
            </Box>
          </Typography>
        </Stack>
      )}
      {!showDisclaimer &&
        customProps &&
        (customProps.get(OPENTALK_EVENT_ID) ? (
          <Button color="error" onClick={handleCancel}>
            Cancel meeting
          </Button>
        ) : (
          <p>This is not an OpenTalk meeting</p>
        ))}
    </Container>
  );
};

export default EventEditPage;
