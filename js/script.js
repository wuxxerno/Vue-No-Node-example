const store = new Vuex.Store({
       
	strict: true,
    state: {
		//Object containing css used to modify the table
		colorTheme: {hightlight:'backgroundColor: orange', 
			clicked: 'backgroundColor: #405d27', 
			hover: 'backgroundColor: #82b74b', 
			hoverAlt: 'backgroundColor: pink',
			passive: 'backgroundColor: #405d27; borderStyle: solid; borderWidth: 0.01vh; borderColor: black;'},
		//Array of dice objects
		dices: [{visible: false, rollable: true, url: '', dots: 0, id: 0},
			{visible: false, rollable: true, url: '', dots: 0, id: 1},
			{visible: false, rollable: true, url: '', dots: 0, id: 2},
			{visible: false, rollable: true, url: '', dots: 0, id: 3},
			{visible: false, rollable: true, url: '', dots: 0, id: 4}],
		//Array of table objects 
		table: [{condition: 'Ettor ', score: 0, css: '', interactive: true, id: 0},
			{condition: 'Tvåor ',score: 0, css: '', interactive: true, id: 1},
			{condition: 'Treor ',score: 0, css: '', interactive: true, id: 2},
			{condition: 'Fyror ',score: 0, css: '', interactive: true, id: 3},
			{condition: 'Femmor ',score: 0, css: '', interactive: true, id: 4},
			{condition: 'Sexor ',score: 0, css: '', interactive: true, id: 5},
			{condition: 'Delsumma ',score: 0, css: '', interactive: false, id: 6},
			{condition: 'Bonus ',score: 0, css: '', interactive: false, id: 7},
			{condition: 'Ett par ',score: 0, css: '', interactive: true, id: 8},
			{condition: 'Två par ',score: 0, css: '', interactive: true, id: 9},
			{condition: 'Triss ',score: 0, css: '', interactive: true, id: 10},
			{condition: 'Fyrtal ',score: 0, css: '', interactive: true, id: 11},
			{condition: 'Ett till fem ',score: 0, css: '', interactive: true, id: 12},
			{condition: 'Två till sex ',score: 0, css: '', interactive: true, id: 13},
			{condition: 'Triss & Par ',score: 0, css: '', interactive: true, id: 14},
			{condition: 'Tärningssumman ',score: 0, css: '', interactive: true, id: 15},
			{condition: 'Fem lika ',score: 0, css: '', interactive: true, id: 16},
			{condition: 'Totalt ',score: 0, css: '', interactive: false, id: 17}],
		//Simplified array of the current dice hand. Always sorted.
		diceComp: [0,0,0,0,0],
		//Helper object to store "metadata" for some comparisons.
		buffer: {rolls: 0, pairValue: [], triCombValue:0, pairCount: 0, triComb: false,quads: false}
			},
	mutations: {
		//Init some table css fields to indicate that they arent interactive.
		init(state){
			state.table[6].css = state.colorTheme.passive
			state.table[7].css = state.colorTheme.passive
			state.table[17].css = state.colorTheme.passive + 'marginBottom:1vh'
		},
        //Method iterated by the roll methods loop.
		//Used to give the dice[i] object its values
		assignDice(state,{visible,index,dots}) {
            state.dices[index].url = 'static/' + dots + '.webp'
            state.dices[index].dots = dots
            state.dices[index].visible = visible
        },
        //Big method to handle screen updates
		update(state, index) {
			
			//Reset session-dependant vars
			state.table[17].score = 0
            state.table[6].score = 0
            state.buffer.rolls = 0
			
			//Mark table entry as non-interactive and set css
			if (state.table[index].interactive) {
                state.table[index].css = state.colorTheme.clicked
                state.table[index].interactive = false
            }
			//Reset dices to make them rollable and not visible
			store.getters.getDices.forEach(function(entry) {
            entry.rollable = true
            entry.visible = false
            })
			//For-each loop for the table
            state.table.forEach(function(entry) {
				//Clear css for interactive objects
			   if (entry.interactive) {
                    entry.css = ''
                    //Clear the scores for every but the clicked object
					if (entry.id != index) {
                        entry.score = 0
                    }
                }
                //Calculate the sum of all object.score to display the total 
				// 17 and 6 are sum fields which has to be exluded.
				if (!entry.interactive && entry.id != 17 && entry.id != 6) {
                    state.table[17].score += entry.score
                    if (entry.id < 6) {
                        state.table[6].score += entry.score
                    }
                }
                //check if the the bonus criteria is reached and assign values
				//63 or more points in the first 6 fields grants a bonus
				if (state.table[6].score >= 63) {
                    state.table[7].score = 50
                }
				})
        },
        //Hover to toggle css themes from and to the table object
		hover(state, index) {
            //If table object already has hover css toggle back to normal highlight
			if (state.table[index].css == state.colorTheme.hover && state.table[index].interactive) {
                state.table[index].css = state.colorTheme.hightlight
            } 
			//If the object is hightlighted apply the hover css
			else if (state.table[index].css == state.colorTheme.hightlight) {
                state.table[index].css = state.colorTheme.hover
            }
        },
        //Called after by the roll method after the randomization is done
		comp(state) {
			//Clear/incr buffer values
			state.buffer.rolls++;
            state.buffer.pairValue = [];
            state.buffer.triCombValue = 0;
            state.buffer.pairCount = 0;
            state.buffer.triComb = false;
            state.buffer.quads = false;
			//Clear the table
			state.table.forEach(function(entry) {            
			   if (entry.interactive) {
                    entry.score = 0
                    entry.css = ''
                }
            })
				//Loop through the dices
				state.dices.forEach(function(entry) {
				//Populate the simple dicevalue array
				state.diceComp[entry.id] = entry.dots

                //Calculate the dice sum 		
                if (state.table[15].interactive) {
                    state.table[15].score += entry.dots
                }
                //Print out the 1-6 options
				//Dots - 1 corresponds to the correct entry in the table
			   if (state.table[entry.dots - 1].interactive) {
                    state.table[entry.dots - 1] .css = state.colorTheme.hightlight
					//Assign the scores to the 1-6 options
					state.table[entry.dots - 1].score += entry.dots
				}
            })
			//Sort the simple dicevalue array
			state.diceComp.sort(function(a, b) {
                return a - b
            })
            //Since the dicevalue array is sorted we can check less values but shift the comparisons.
			//In a sorted array checking index 0,2 would be sufficient to spot a triple. Then shift by one and continue. 
			//Check for pairs
            if (state.diceComp[0] == state.diceComp[1]) {
                state.buffer.pairCount++
                state.buffer.pairValue.push(state.diceComp[0])
            }
            //Make sure 3x wouldnt be counted as 2 pairs
            if (state.diceComp[1] == state.diceComp[2] && state.diceComp[2] != state.diceComp[0]) {
                state.buffer.pairCount++
                state.buffer.pairValue.push(state.diceComp[1])
            }
            //Make sure 3x wouldnt be counted as 2 pairs
            if (state.diceComp[2] == state.diceComp[3] && state.diceComp[3] != state.diceComp[1]) {
                state.buffer.pairCount++
                state.buffer.pairValue.push(state.diceComp[2])
            }
            //Make sure 3x wouldnt be counted as 2 pairs
            if (state.diceComp[3] == state.diceComp[4] && state.diceComp[4] != state.diceComp[2]) {
                state.buffer.pairCount++
                state.buffer.pairValue.push(state.diceComp[3])
            }
            //Check for triple combos
            //Array is sorted so we can check 2 values between 3 indexes to detect triples
            if (state.diceComp[0] == state.diceComp[2]) {
                state.buffer.triCombValue = state.diceComp[0]
                state.buffer.triComb = true
            }
            //Only one triplet can exist
            else if (state.diceComp[1] == state.diceComp[3]) {
                state.buffer.triCombValue = state.diceComp[1]
                state.buffer.triComb = true
            }
            //Only one triplet can exist
            else if (state.diceComp[2] == state.diceComp[4]) {
                state.buffer.triCombValue = state.diceComp[2]
                state.buffer.triComb = true
            }
            //Check for fyrtal
            //Array is sorted so we can check 2 values between 4 indexes to detect quads
            if (state.diceComp[0] == state.diceComp[3]) {
                state.buffer.quads = true
            }
            //Only one quad can exist
            else if (state.diceComp[1] == state.diceComp[4]) {
                state.buffer.quads = true
            }
            //Print out options!
            //Check for femtal
            if (state.diceComp[0] == state.diceComp[4] && state.table[16].interactive) {
                state.table[16].css = state.colorTheme.hightlight
                //Assign the score value
				state.table[16].score = 50
            }

            //Check 1-5 l.stege
            if (state.buffer.pairCount < 1 && state.diceComp[0] == 1 && state.diceComp[4] == 5 && state.table[12].interactive) {
                state.table[12].css = state.colorTheme.hightlight
                //Assign the score value
				state.table[12].score = 15
            }
            //2-6 s.stege
            if (state.buffer.pairCount < 1 && state.diceComp[0] == 2 && state.diceComp[4] == 6 && state.table[13].interactive) {
                state.table[13].css = state.colorTheme.hightlight
                //Assign the score value
				state.table[13].score = 20
            }
            //Print fyrtal
            if (state.buffer.quads && state.table[11].interactive) {
                state.table[11].css = state.colorTheme.hightlight
                //Assign the score value
				state.table[11].score = (state.diceComp[2] * 4)
            }
            //Print två par
            if (state.buffer.pairCount > 1 && state.table[9].interactive) {
                state.table[9].css = state.colorTheme.hightlight
                //Assign the score value
				state.table[9].score = (state.buffer.pairValue[0] * 2) + (state.buffer.pairValue[1] * 2)
            }
            //Print ett par
            if (state.buffer.pairCount > 0 && state.table[8].interactive) {
                state.table[8].css = state.colorTheme.hightlight
				//Assign the score value
                state.table[8].score = (state.buffer.pairValue[0] * 2)

                if (state.buffer.pairCount > 1) {
                    state.table[8].score = (state.buffer.pairValue[0] * 2)
					//Display the pair with the highest score if two are present
                    if (state.buffer.pairValue[0] > state.buffer.pairValue[1]) {
                        //Assign the score value
						state.table[8].score = (state.buffer.pairValue[0] * 2)
                    } 
					else {
                        //Assign the score value
						state.table[8].score = (state.buffer.pairValue[1] * 2)
                    }
                }
            }
            //Print triple
            if (state.buffer.triComb && state.table[10].interactive) {
                state.table[10].css = state.colorTheme.hightlight
                state.table[10].score = (state.buffer.triCombValue * 3)

                //Print triple & double
                if (state.buffer.pairCount > 1 && state.table[14].interactive) {
                    state.table[14].css = state.colorTheme.hightlight
                    if (state.buffer.pairValue[0] == state.buffer.triCombValue) {
                        state.buffer.pairValue.shift()
                    } else {
                        state.buffer.pairValue.pop()
                    }
                    state.table[14].score = (state.buffer.triCombValue * 3) + (state.buffer.pairValue[0] * 2)
                }
            }
            //Print the dice sum
            if (state.table[15].interactive) {
                state.table[15].css = state.colorTheme.hightlight
            }
        },
        //Toggles the lock if the dice at index[i] should be rollable
        toggleLock(state, index) {
            state.dices[index].rollable = !state.dices[index].rollable
        }
    },
    getters: {
        getDices: state => {
            return state.dices
        },
        getTable: state => {
            return state.table
        },
        getFresh: state => {
            return state.fresh
        }
    }
}
);
//Scorebutton component, repeated for each object in the Table array.
Vue.component('scorebtn', {
    props: ['condition', 'score'],
    template: '<button tabindex="-1" class="card"id="btn1">{{condition}}<span>{{score}}</span>p</button>'
});
//"hand component" repeated for every dice which is not rollable
Vue.component('hand', {
    props: ['url', 'rollable'],
    template: '<div  class="dices" id="dice1" ><img v-if="!rollable" v-bind:src="url" /></div>'
});
//Main app
const app = new Vue({
    el: "#game",
    store: store,
    data: {
		//Used to toggle css animation classes
		isActive: false
    },
    created() {
        //Apply static css
		store.commit('init')
		//Create listener
		document.addEventListener("keyup", function(event) {
            //Detect spacebar press
			if (event.which == 32) {
                app.roll()
            } 
			//Send 1-5 key-"codes"
			else {
				app.unlock(event.which, true)}
        })
    },
    computed: {
        //Fetch values from vuex
		table: function() {
            return this.$store.state.table
        },
		//Fetch values from vuex
		dices: function() {
            return this.$store.state.dices
        }
    },
    methods: {
        //Calls the update mutator to give the user the correct response
		click: function(i) {
            if (store.state.table[i].interactive && store.state.buffer.rolls > 0) {
                store.commit('update', i)
            }
        },
        //Calls the hover-mutator
		hover: function(i) {
            store.commit('hover', i)
        },
       
		//Toggles the dices locked status
		//Boolean kboard is used to identify where the input is from
		unlock: function(i, kboard) {
            //Mouse click input
			if (!kboard && store.state.buffer.rolls > 0) {
                store.commit('toggleLock', i)
            }
            //Keyboard input
			//Only allow the event.which var 49-53 which translates to 1-5 keys
			if (i > 48 && i < 54 && kboard && store.state.buffer.rolls > 0) {
				//Subtract 49 from i to get 0-4 which is the correct input to toggleLock
			   store.commit('toggleLock', i - 49)
            }
        },
        //Randomize dices
		roll: function(event) {
			//Block more than 3 concurrant rolls
			if (store.state.buffer.rolls < 3) {
                store.getters.getDices.forEach(function(entry) {
                    //Roll only rollable dices
					if (entry.rollable) {
                        store.commit('assignDice', {
                            visible: true,
                            index: entry.id,
                            dots: Math.floor(1 + Math.random() * 6)
                        });
                    }
                });
				//Toggle css spinning animation
				this.isActive = !this.isActive               
			   //Begin the score mutator
			   store.commit('comp');   
            }
        },
    }
});