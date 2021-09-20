const { graphqlHTTP } = require('express-graphql')
const { GraphQLSchema, GraphQLObjectType, GraphQLList, GraphQLInt, GraphQLString, GraphQLFloat, GraphQLBoolean } = require('graphql')

const fetchMethods = require('../controllers/fetchControllers');

const PlayerType = new GraphQLObjectType({
    name: 'Player',
    description: 'a player type',
    
    fields: () => ({
        id: {
            type: GraphQLInt,
            resolve: player => player.id
        },
        chance_of_playing_next_round: {
            type: GraphQLInt,
            resolve: player => player.chance_of_playing_next_round
        },
        cost_change_event: {
            type: GraphQLInt,
            resolve: player => player.cost_change_event
        },
        element_type: {
            type: GraphQLInt,
            resolve: player => player.element_type
        },
        event_points: {
            type: GraphQLInt,
            resolve: player => player.event_points
        },
        first_name: {
            type: GraphQLString,
            resolve: player => player.first_name
        },
        second_name: {
            type: GraphQLString,
            resolve: player => player.second_name
        },
        web_name: {
            type: GraphQLString,
            resolve: (player) => player.web_name
        },
        form: {
            type: GraphQLFloat,
            resolve: player => parseFloat(player.form) 
        },
        news: {
            type: GraphQLString,
            resolve: player => player.news
        },
        news_added: {
            type: GraphQLString,
            resolve: player => player.news_added
        },
        now_cost: {
            type: GraphQLFloat,
            resolve: player => player.now_cost
        },
        points_per_game: {
            type: GraphQLFloat,
            resolve: player => parseFloat(player.points_per_game)
        },
        selected_by_percent: {
            type: GraphQLFloat,
            resolve: player => parseFloat(player.selected_by_percent)
        },
        team: {
            type: GraphQLInt,
            resolve: player => player.team
        },
        total_points: {
            type: GraphQLInt,
            resolve: player => player.total_points
        },
        transfers_in_event: {
            type: GraphQLInt,
            resolve: player => player.transfers_in_event
        },
        transfers_out_event: {
            type: GraphQLInt,
            resolve: player => player.transfers_out_event
        },
        minutes: {
            type: GraphQLInt,
            resolve: player => player.minutes
        },
        goals_scored: {
            type: GraphQLInt,
            resolve: player => player.goals_scored
        },
        assists: {
            type: GraphQLInt,
            resolve: player => player.assists
        },
        saves: {
            type: GraphQLInt,
            resolve: player => player.saves
        },
        bonus: {
            type: GraphQLInt,
            resolve: player => player.bonus
        },
        bps: {
            type: GraphQLInt,
            resolve: player => player.bps
        },
        influence: {
            type: GraphQLFloat,
            resolve: player => parseFloat(player.influence)
        },
        creativity: {
            type: GraphQLFloat,
            resolve: player => parseFloat(player.creativity)
        },
        threat: {
            type: GraphQLFloat,
            resolve: player => parseFloat(player.threat)
        },
        ict_index: {
            type: GraphQLFloat,
            resolve: player => parseFloat(player.ict_index)
        },
        upcomingFixtures: {
            type: GraphQLList(UpcomingFixtureType),
            args: {
                id: {
                    type: GraphQLInt
                }
            },
            resolve: async (args) => {
                let playerUpcomingFixtures = await fetchMethods.getPlayerEventsById(args.id);
                return playerUpcomingFixtures.fixtures
            }
        },
        pastFixtures: {
            type: GraphQLList(PastFixtureType),
            args: {
                id: {
                    type: GraphQLInt
                }
            },
            resolve: async (args) => {
                let playerEvents = await fetchMethods.getPlayerEventsById(args.id)
                return playerEvents.history
            }
        }
    })
})

const UpcomingFixtureType = new GraphQLObjectType({
    name: 'upcomingFixture',
    description: 'upcoming fixture',

    fields: () => ({
        id: {
            type: GraphQLInt,
            resolve: upcomingFixture => upcomingFixture.id
        },
        event: {
            type: GraphQLInt,
            resolve: upcomingFixture => upcomingFixture.event
        },
        minutes: {
            type: GraphQLInt,
            resolve: upcomingFixture => upcomingFixture.minutes
        },
        difficulty: {
            type: GraphQLInt,
            resolve: upcomingFixture => upcomingFixture.difficulty
        },
        team_h: {
            type: GraphQLInt,
            resolve: upcomingFixture => upcomingFixture.team_h
        },
        team_a: {
            type: GraphQLInt,
            resolve: upcomingFixture => upcomingFixture.team_a
        },
        finished: {
            type: GraphQLBoolean,
            resolve: upcomingFixture => upcomingFixture.finished
        },
        is_home: {
            type: GraphQLBoolean,
            resolve: upcomingFixture => upcomingFixture.is_home
        }
    })
})

const PastFixtureType = new GraphQLObjectType({
    name: 'PastFixture',
    description: 'Past fixtures',

    fields: () => ({
        was_home: {
            type: GraphQLBoolean,
            resolve: PastFixture => PastFixture.was_home
        },
        opponent_team: {
            type: GraphQLInt,
            resolve: PastFixture => PastFixture.opponent_team
        },
        total_points: {
            type: GraphQLInt,
            resolve: PastFixture => PastFixture.total_points
        },
        team_h_score: {
            type: GraphQLInt,
            resolve: PastFixture => PastFixture.team_h_score
        },
        team_a_score: {
            type: GraphQLInt,
            resolve: PastFixture => PastFixture.team_a_score
        },
        round: {
            type: GraphQLInt,
            resolve: PastFixture => PastFixture.round
        },
        minutes: {
            type: GraphQLInt,
            resolve: PastFixture => PastFixture.minutes
        },
        goals_scored: {
            type: GraphQLInt,
            resolve: PastFixture => PastFixture.goals_scored
        },
        assists: {
            type: GraphQLInt,
            resolve: PastFixture => PastFixture.assists
        },
        clean_sheets: {
            type: GraphQLInt,
            resolve: PastFixture => PastFixture.clean_sheets
        },
        goals_conceded: {
            type: GraphQLInt,
            resolve: PastFixture => PastFixture.goals_conceded
        },
        own_goals: {
            type: GraphQLInt,
            resolve: PastFixture => PastFixture.own_goals
        },
        penalties_saved: {
            type: GraphQLInt,
            resolve: PastFixture => PastFixture.penalties_saved
        },
        penalties_missed: {
            type: GraphQLInt,
            resolve: PastFixture => PastFixture.penalties_missed
        },
        yellow_cards: {
            type: GraphQLInt,
            resolve: PastFixture => PastFixture.yellow_cards
        },
        red_cards: {
            type: GraphQLInt,
            resolve: PastFixture => PastFixture.red_cards
        },
        saves: {
            type: GraphQLInt,
            resolve: PastFixture => PastFixture.saves
        },
        bps: {
            type: GraphQLInt,
            resolve: PastFixture => PastFixture.bps
        },
        value: {
            type: GraphQLInt,
            resolve: PastFixture => PastFixture.value
        },
        selected: {
            type: GraphQLInt,
            resolve: PastFixture => PastFixture.selected
        },
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