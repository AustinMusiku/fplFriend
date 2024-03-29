const { 
    GraphQLSchema,
    GraphQLObjectType, 
    GraphQLList, 
    GraphQLInt, 
    GraphQLString, 
    GraphQLFloat, 
    GraphQLBoolean } = require('graphql')

const fetchMethods = require('../controllers/fetchControllers');

const PlayerType = new GraphQLObjectType({
    name: 'Player',
    description: 'a player type',
    
    fields: () => ({
        id: { type: GraphQLInt },
        code: { type: GraphQLInt },
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
                gw: { type: GraphQLInt },
                first: { type: GraphQLInt },
                last: { type: GraphQLInt },
            },
            resolve: async (parent, args, { loaders }) => {
                let playerUpcomingFixtures = loaders.playerEvent.loadMany([parent.id]);
                let fixs = await playerUpcomingFixtures;
                
                if(args.gw){
                    return fixs[0].fixtures.filter(fix => fix.event == args.gw);
                }
                if(args.first && args.last){
                    return fixs[0].fixtures.filter(fix => fix.event >= args.first && fix.event < args.last);
                }

                return fixs[0].fixtures;
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
        is_home: { type: GraphQLBoolean },
        kickoff_time: { type: GraphQLString }
    })
})

const PastFixtureType = new GraphQLObjectType({
    name: 'PastFixture',
    description: 'Past fixtures',

    fields: () => ({
        was_home: { type: GraphQLBoolean },
        opponent_team: { type: GraphQLInt },
        total_points: { type: GraphQLInt },
        team_h_score: { type: GraphQLInt },
        team_a_score: { type: GraphQLInt },
        round: { type: GraphQLInt },
        minutes: { type: GraphQLInt },
        goals_scored: { type: GraphQLInt },
        assists: { type: GraphQLInt },
        clean_sheets: { type: GraphQLInt },
        goals_conceded: { type: GraphQLInt },
        own_goals: { type: GraphQLInt },
        penalties_saved: { type: GraphQLInt },
        penalties_missed: { type: GraphQLInt },
        yellow_cards: { type: GraphQLInt },
        red_cards: { type: GraphQLInt },
        saves: { type: GraphQLInt },
        bps: { type: GraphQLInt },
        value: { type: GraphQLInt },
        selected: { type: GraphQLInt },
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
        highest_score: { type: GraphQLInt },
        deadline_time: { type: GraphQLString },
        finished: { type: GraphQLBoolean },
        is_previous: { type: GraphQLBoolean },
        is_current: { type: GraphQLBoolean },
        is_next: { type: GraphQLBoolean },
        avg_points: { 
            type: GraphQLInt,
            resolve: async gameweek => {
                return gameweek.average_entry_score
            }
        },
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
                first: { type: GraphQLInt },
                by_form: { type: GraphQLBoolean },
                by_transfers: { type: GraphQLBoolean },
                by_points: { type: GraphQLBoolean },
                trim_extras: { type: GraphQLBoolean },
                differentials: { type: GraphQLBoolean },
                captains: { type: GraphQLBoolean },
                premiums: { type: GraphQLBoolean },
                mid_rangers: { type: GraphQLBoolean },
                budgets: { type: GraphQLBoolean }
            },
            resolve: async(parent, args) => {
                let players = await fetchMethods.getAllPlayers();
                if(args.by_form){
                    players = players.sort((a,b) => b.form - a.form)
                }
                if(args.by_transfers){
                    players = players
                        .sort((a,b) => (b.transfers_in_event + b.transfers_out_event) - (a.transfers_in_event + a.transfers_out_event))
                        .slice(0, 20);
                }
                if(args.by_points){
                    players = players
                        .sort((a,b) => (b.total_points - a.total_points))
                        .slice(0, 20);
                }
                if(args.trim_extras){
                    players = players.filter(p => p.form != 0 && p.minutes > 45 && p.chance_of_playing_next_round != 0)
                }
                if(args.differentials){
                    players = players.filter( p => p.selected_by_percent < 12)
                }
                if(args.captains){
                    players = players.filter(p => p.now_cost > 75 && p.chance_of_playing_next_round != 75 && p.chance_of_playing_next_round != 50 && p.chance_of_playing_next_round != 25)
                }
                if(args.premiums){
                    players = players.filter(p => p.now_cost > 99)
                }
                if(args.mid_rangers){
                    players = players.filter(p => p.now_cost < 99 && p.now_cost > 66)
                }
                if(args.budgets){
                    players = players
                        .filter(p => p.now_cost < 66)
                        .sort((a, b) => b.form - a.form);
                }
                if(args.first){
                    players = players.slice(0, args.first)
                }
                return players;
            }
        },
        player: {
            type: PlayerType,
            description: 'One Player',
            args: {
                id: { type: GraphQLInt }
            },
            resolve: async(parent, args, { loaders }) => {
                let loaded = loaders.player.load(args.id)
                let player = await loaded;
                return player[0];
            }
        },
        gameweeks: {
            type: GraphQLList(GameWeekType),
            description: 'All gameweeks',
            args: {
                is_finished: { type: GraphQLBoolean }
            },
            resolve: async (parent, args) => {
                let gws = await fetchMethods.gameWeeks()
                if(args.is_finished){
                    gws = gws.filter(gw => gw.finished == true);
                }
                return gws;
            } 
        },
        gameweek: {
            type: GameWeekType,
            description: 'One gameweek',
            args: {
                id: {  type: GraphQLInt  },
                is_current: {  type: GraphQLBoolean  },
                is_next: {  type: GraphQLBoolean  },
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