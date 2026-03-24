import { Inngest } from "inngest";
import { INNGEST_APP_ID, INNGEST_EVENT_NAME } from "@/lib/constants";

// Local schema for Inngest events
export type Events = {
  "contract/analyze": {
    data: {
      documentId: string;
      ownerId: string;
      fileName: string;
    };
  };
};

// Create a client to send and receive events
export const inngest = new Inngest({ 
  id: INNGEST_APP_ID,
  schemas: {
    [INNGEST_EVENT_NAME]: {
      data: {
        documentId: "string",
        ownerId: "string",
        fileName: "string",
      },
    },
  }
});
