export const typeDefs = `

type Channel {
   id: ID!                # "!" denotes a required field
   name: String
   messages: [Message]!
}

type Message {
  id: ID!
  text: String
}

input MessageInput{
  channelId: ID!
  text: String
}

# This type specifies the entry points into our API. In this case
# there is only one - "channels" - which returns a list of channels.
type Query {
  channels: [Channel]    # "[]" means this is a list of channels
  channel(id: ID!): Channel
}

type Mutation {
  # A mutation to add a new channel to the list of channels
  addChannel(name: String!): Channel
  addMessage(message: MessageInput!): Message
}

type Subscription {
  messageAdded(channelId: ID!): Message
}
`;
