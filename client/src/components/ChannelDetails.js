import React, { Component } from 'react';
import MessageList from './MessageList';
import ChannelPreview from './ChannelPreview';
import NotFound from './NotFound';

import { graphql } from 'react-apollo';
import gql from 'graphql-tag';
function isDuplicateDocument(newDocument, existingDocuments) {
  return (
    newDocument.id !== null &&
    existingDocuments.some(doc => newDocument.id === doc.id)
  );
}
class ChannelDetails extends Component {
  componentWillMount() {
    this.props.data.subscribeToMore({
      document: messagesSubscription,
      variables: {
        channelId: this.props.match.params.channelId
      },
      updateQuery: (prev, { subscriptionData }) => {
        if (!subscriptionData.data) {
          return prev;
        }
        const newMessage = subscriptionData.data.messageAdded;
        // don't double add the message
        if (isDuplicateDocument(newMessage, prev.channel.messages)) {
          return prev;
        }
        const messages = prev.channel.messages.filter(msg => msg.id > 0);
        return {
          ...prev,
          channel: {
            ...prev.channel,
            messages: [...messages, newMessage]
          }
        };
      }
    });
  }

  render() {
    const { data: { loading, error, channel }, match } = this.props;

    if (loading) {
      return <ChannelPreview channelId={match.params.channelId} />;
    }
    if (error) {
      return <p>{error.message}</p>;
    }
    if (channel === null) {
      return <NotFound />;
    }

    return (
      <div>
        <div className="channelName">{channel.name}</div>
        <MessageList messages={channel.messages} />
      </div>
    );
  }
}

export const channelDetailsQuery = gql`
  query ChannelDetailsQuery($channelId: ID!) {
    channel(id: $channelId) {
      id
      name
      messages {
        id
        text
      }
    }
  }
`;

const messagesSubscription = gql`
  subscription messageAdded($channelId: ID!) {
    messageAdded(channelId: $channelId) {
      id
      text
    }
  }
`;

export default graphql(channelDetailsQuery, {
  options: props => ({
    variables: { channelId: props.match.params.channelId }
  })
})(ChannelDetails);
