import { Inngest } from "inngest";

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
  id: "contract-clear-ai",
  schemas: {
    "contract/analyze": {
      data: {
        documentId: "string",
        ownerId: "string",
        fileName: "string",
      },
    },
  }
});
