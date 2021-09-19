const { graphqlHTTP } = require('express-graphql')
const { GraphQLSchema, GraphQLObjectType, GraphQLList, GraphQLInt, GraphQLString } = require('graphql')

const fetchMethods = require('../controllers/fetchControllers');

const PlayerType = new GraphQLObjectType({
    name: 'Player',
    description: 'a player type',
    
    fields: () => ({
        chance_of_playing_next_round: {
            type: GraphQLInt,
            resolve: async (player) => {
                chance_of_playing_next_round = await player.chance_of_playing_next_round
                return chance_of_playing_next_round
            }
        },
        cost_change_event: {
            type: GraphQLInt,
            resolve: async (player) => {
                cost_change_event = await player.cost_change_event;
                return cost_change_event;
            }
        },
        element_type: {
            type: GraphQLInt,
            resolve: async (player) => {
                element_type = await player.element_type;
                return element_type;
            } 
        },
        event_points: {
            type: GraphQLInt,
            resolve: async (player) => {
                event_points = await player.event_points;
                return event_points;
            } 
        },
        first_name: {
            type: GraphQLString,
            resolve: async (player) => {
                first_name = await player.first_name;
                return first_name;
            } 
        },
        second_name: {
            type: GraphQLString,
            resolve: async (player) => {
                second_name = await player.second_name;
                return second_name;
            } 
        },
        web_name: {
            type: GraphQLString,
            resolve: async (player) => {
                web_name = await player.web_name;
                return web_name;
            } 
        }
    })
})

const RootQuery = new GraphQLObjectType({
    name: 'RootQuery',
    description: 'Root Query',

    fields: () => ({
        players: {
            type: GraphQLList(PlayerType),
            description: 'All players',
            resolve: async() => {
                let players = await fetchMethods.getAllPlayers();
                return players;
            }
        },
        player: {
            type: PlayerType,
            description: 'One Player',
            args: {
                id: {
                    type: GraphQLInt
                }
            },
            resolve: async(parent, args) => {
                let player = await fetchMethods.getPlayerDataById(args.id);
                return player[0];
            }
        }
    })
})

module.exports.Schema = new GraphQLSchema({
    query: RootQuery
})