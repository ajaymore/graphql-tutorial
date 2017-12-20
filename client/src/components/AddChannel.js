import React from 'react';
import { graphql } from 'react-apollo';
import gql from 'graphql-tag';
import { channelsListQuery } from './ChannelsListWithData';

const AddChannel = ({ mutate }) => {
  const handleKeyUp = evt => {
    if (evt.keyCode === 13) {
      evt.persist();
      mutate({
        variables: { name: evt.target.value },
        // refetchQueries: [{ query: channelsListQuery }],
        update: (store, { data: { addChannel } }) => {
          // Read the data from the cache for this query.
          const data = store.readQuery({ query: channelsListQuery });
          // Add our channel from the mutation to the end.
          data.channels.push(addChannel);
          // Write the data back to the cache.
          store.writeQuery({ query: channelsListQuery, data });
        },
        optimisticResponse: {
          __typename: 'Mutation',
          addChannel: {
            name: evt.target.value,
            id: Math.round(Math.random() * -1000000),
            __typename: 'Channel'
          }
        }
      }).then(res => {
        evt.target.value = '';
      });
    }
  };

  return <input type="text" placeholder="New channel" onKeyUp={handleKeyUp} />;
};

const addChannelMutation = gql`
  mutation addChannel($name: String!) {
    addChannel(name: $name) {
      id
      name
    }
  }
`;

const AddChannelWithMutation = graphql(addChannelMutation)(AddChannel);

export default AddChannelWithMutation;
