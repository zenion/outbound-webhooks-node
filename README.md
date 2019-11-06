# Outbound Webhooks Framework for NodeJS

Flexible framework for managing outbound webhooks from a NodeJS application. Still a work in progress but features will include:

- Ability to plugin different custom storage providers (built-in memory and json providers)
- Event driven architecture (create arbitrary events, trigger on them to any subscribers of said events)
- Ability to store arbitrary metadata inside the webhooks (perhaps you want to have your own custom data/references embedded in the webhook itself)
