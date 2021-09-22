const { GraphQLSchema, GraphQLObjectType, GraphQLList, GraphQLInt, GraphQLString, GraphQLFloat, GraphQLBoolean } = require('graphql')

const fetchMethods = require('../controllers/fetchControllers');

const PlayerType = new GraphQLObjectType({
    name: 'Player',
    description: 'a player type',
    
    fields: () => ({
        id: { type: GraphQLInt },
        chance_of_playing_next_round: { type: GraphQLInt },
        cost_change_event: { type: GraphQLInt },
        element_type: { type: GraphQLInt },
        event_points: { type: GraphQLInt },
        first_name: { type: GraphQLString },
        second_name: { type: GraphQLString },
        web_name: { type: GraphQLString },
        news: { type: GraphQLString },
        news_added: { type: GraphQLString },
        now_cost: { type: GraphQLFloat },
        team: { type: GraphQLInt },
        total_points: { type: GraphQLInt },
        transfers_in_event: { type: GraphQLInt },
        transfers_out_event: { type: GraphQLInt },
        minutes: { type: GraphQLInt },
        goals_scored: { type: GraphQLInt },
        assists: { type: GraphQLInt },
        saves: { type: GraphQLInt },
        bonus: { type: GraphQLInt },
        bps: { type: GraphQLInt },
        form: {
            type: GraphQLFloat,
            resolve: player => parseFloat(player.form) 
        },
        points_per_game: {
            type: GraphQLFloat,
            resolve: player => parseFloat(player.points_per_game)
        },
        selected_by_percent: {
            type: GraphQLFloat,
            resolve: player => parseFloat(player.selected_by_percent)
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
        UpcomingFixtures: {
            type: GraphQLList(UpcomingFixtureType),
            args: {
                first: {
                    type: GraphQLInt
                }
            },
            resolve: async (parent, args) => {
                let playerUpcomingFixtures = await fetchMethods.getPlayerEventsById(parent.id);
                return playerUpcomingFixtures.fixtures.slice(0, args.first)
            }
        },
        pastFixtures: {
            type: GraphQLList(PastFixtureType),
            resolve: async (parent) => {
                let playerEvents = await fetchMethods.getPlayerEventsById(parent.id)
                return playerEvents.history
            }
        }
    })
})

const UpcomingFixtureType = new GraphQLObjectType({
    name: 'UpcomingFixture',
    description: 'upcoming fixture',

    fields: () => ({
        id: { type: GraphQLInt },
        event: { type: GraphQLInt },
        minutes: { type: GraphQLInt },
        difficulty: { type: GraphQLInt },
        team_h: { type: GraphQLInt },
        team_a: { type: GraphQLInt },
        finished: { type: GraphQLBoolean },
        is_home: { type: GraphQLBoolean }
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

const ChipType = new GraphQLObjectType({
    name: 'Chip',
    description: 'Chip details',

    fields: () => ({
        chip_name: { type: GraphQLString },
        num_played : { type: GraphQLInt }
    })
})

const GameWeekType = new GraphQLObjectType({
    name: 'Gameweek',
    description: 'Gameweek data',

    fields: () => ({
        id: { type: GraphQLInt },
        deadline_time: { type: GraphQLString },
        finished: { type: GraphQLBoolean },
        is_previous: { type: GraphQLBoolean },
        is_current: { type: GraphQLBoolean },
        is_next: { type: GraphQLBoolean },
        chip_plays: {
            type: GraphQLList(ChipType),
            resolve: async parent => {
                return parent.chip_plays
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
            args: {
                first: {
                    type: GraphQLInt
                },
                by_form: {
                    type: GraphQLBoolean
                },
                trim_extras: {
                    type: GraphQLBoolean
                },
                differentials: {
                    type: GraphQLBoolean
                },
                captains: {
                    type: GraphQLBoolean
                }
            },
            resolve: async(parent, args) => {
                let players = await fetchMethods.getAllPlayers();
                if(args.by_form){
                    players = players.sort((a,b) => b.form - a.form)
                }
                if(args.first){
                    players = players.slice(0, args.first)
                }
                if(args.trim_extras){
                    players = players.filter(p => p.form != 0 && p.minutes > 45)
                }
                if(args.differentials){
                    players = players.filter( p => p.selected_by_percent < 15)
                }
                if(args.captains){
                    players = players.filter(p => p.now_cost > 70 && p.chance_of_playing_next_round != 75 && p.chance_of_playing_next_round != 50 && p.chance_of_playing_next_round != 25 && p.chance_of_playing_next_round != 0)
                }
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
        },
        gameweeks: {
            type: GraphQLList(GameWeekType),
            description: 'All gameweeks',
            resolve: async () => {
                let gws = await fetchMethods.gameWeeks()
                return gws;
            } 
        },
        gameweek: {
            type: GameWeekType,
            description: 'One gameweek',
            args: {
                id: { 
                    type: GraphQLInt 
                },
                is_current: { 
                    type: GraphQLBoolean 
                },
                is_next: { 
                    type: GraphQLBoolean 
                },
            },
            resolve: async (parent, args) => {
                let gws = await fetchMethods.gameWeeks()
                if(args.id){
                    let gw = gws.filter(gw => gw.id == args.id);
                    return gw[0];
                }else if(args.is_current){
                    let gw = gws.filter(gw => gw.is_current == args.is_current);
                    return gw[0];
                }else if(args.is_next){
                    let gw = gws.filter(gw => gw.is_next == args.is_next);
                    return gw[0];
                }
            }
        }
    })
})

module.exports.Schema = new GraphQLSchema({
    query: RootQuery
})