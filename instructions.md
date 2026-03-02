Here we're going to create an MCP for Invoice Ninja. 

First thing to do is to investigate all the current implementations of Invoice Ninja MCPs. We should investigate what functionality they offer and we should include all the good examples into our server. 

We should write the server in TypeScript. 

We should research best practices for making MCP servers and implement that. 

At this stage, it would just be local only. So we should include install instructions for Clawed, Code and Clawed Desktop in the readme. 

The primary reason for creating this MCP server is being able to add invoices to Invoice Ninja through the MCP server.

Access to Invoice Ninja should be an API key provided in the MCP config. 

In the .env file, there is a INVOICE_NINJA_API_TOKEN token for testing. 

It needs to be installable as an npx one-linear in the claude MCP config.

The first thing to do is to create a report of all the functionality of the existing MCP servers available on GitHub. 