import React from 'react';
import { graphql } from 'react-apollo';
import gql from 'graphql-tag';
import { channelDetailsQuery } from './ChannelDetails';
import { withRouter } from 'react-router';

function isDuplicateDocument(newDocument, existingDocuments) {
  return (
    newDocument.id !== null &&
    existingDocuments.some(doc => newDocument.id === doc.id)
  );
}

const AddMessage = ({ mutate, match }) => {
  const handleKeyUp = evt => {
    if (evt.keyCode === 13) {
      mutate({
        variables: {
          message: {
            channelId: match.params.channelId,
            text: evt.target.value
          }
        },
        optimisticResponse: {
          __typename: 'Mutation',
          addMessage: {
            text: evt.target.value,
            id: Math.round(Math.random() * -1000000),
            __typename: 'Message'
          }
        },
        update: (store, { data: { addMessage } }) => {
          // Read the data from the cache for this query.
          const data = store.readQuery({
            query: channelDetailsQuery,
            variables: {
              channelId: match.params.channelId
            }
          });

          if (isDuplicateDocument(addMessage, data.channel.messages)) {
            return;
          }
          // don't double add the message
          data.channel.messages.push(addMessage);
          // Write the data back to the cache.
          store.writeQuery({
            query: channelDetailsQuery,
            variables: {
              channelId: match.params.channelId
            },
            data
          });
        }
      });
      evt.target.value = '';
    }
  };

  return (
    <div className="messageInput">
      <input type="text" placeholder="New message" onKeyUp={handleKeyUp} />
    </div>
  );
};

const addMessageMutation = gql`
  mutation addMessage($message: MessageInput!) {
    addMessage(message: $message) {
      id
      text
    }
  }
`;

const AddMessageWithMutation = graphql(addMessageMutation)(
  withRouter(AddMessage)
);

export default AddMessageWithMutation;
