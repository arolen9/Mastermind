/* global variables */

var allPossibleCodes, strategicGuesses, guess = [0,0,0,0], answer = [0,0];



/* main function called from the HTML on button click */
function mainFunct () {
	// generate array of all possible codes - 1296 possibilities of 4 out of 6 possible digits with repetitions allowed
	allPossibleCodes = initArray ();
	//generate strategic guesses in a cheating minimax manner
	strategicGuesses = createStrategyGuesses (2);
	//rest of the code is interaction with user handled by evaluateGuesses()
	evaluateGuesses ();
	

}

/* this function sets the variables needed to create permutations */
function initArray () {
	var possibilities = [ 1,2,3,4,5,6 ]; // set of possibilities to permute through
	var n = 4; // code length
	var code = []; // initial code


	// init first permutation 
	for (var i=0; i<4 ; i++ )
	{
		code[i] = possibilities[0];
	}

	// get all permutations (with repetition) from set of 'possibilities'
	var permutations = getPermutations (code, possibilities);
	return permutations;
}



/* this function uses recursion to generate permutations (codes) with repetition of elements from set of given possibilities*/
function getPermutations(code, possibilities){

	var n = code.length, // n=4
	permutations = [], // this will be the array of codes to be returned
	spliceElem = [], // used to append to recursively permuted array
	spliceArr = [], // this is the array used in recursion
	restPerms = [], // value returned from recursion , i.e permuted array
	pushElem = []; // this is the code returned from recursive permute that will be pushed to permutations, used in recursion as well

	// we will stop recursion when there is nothing more to permute
	if (n <= 1)
	{
		return possibilities; // could hard code this as return [1,2,3,4,5,6] so as to not recursively pass it, but then logic suffers
	}


	// copy argument array as so not to change it
	spliceArr = code;
	
	// we are always removing the first element and producing a shorter array to permute
	spliceElem = spliceArr.splice(0, 1);

	//actual recursion
	restPerms = getPermutations(spliceArr, possibilities);

	// once we reach a point when there is nothing to permute, i.e. array length = 1, then we combine results to generate the code
	for (var x=0; x<possibilities.length; x++)
	{
		for (var y = 0; y<restPerms.length; y++)
		{
			pushElem = spliceElem.concat(restPerms[y]);
			permutations.push(pushElem);
		}
		spliceElem[0]++;
	}
	return permutations; // returns the permutation list
}


/* takes array "guess" and prints input boxes for feedback */
function evaluateGuesses (){

	if (compareArrays(guess,[0,0,0,0]) == 1)
	{
		//we're here for the first time and need to establish conversation with user
		//select a random strategic guess, then display it with input boxes for user feedback
		guess = strategicGuesses.splice(Math.floor(Math.random()*strategicGuesses.length), 1);
		guess = guess[0];
		//console.log("strategicGuesses: " + strategicGuesses);

		//print the HTML code for user feedback to div id=interaction
		printGuess ();

		return 0;
		
	}
	else 
	{
		//since guess is not the initial value of [0,0,0,0], it must have been changed
		//this means we interaacted with the User and we should have user feedback
		//note guess can never be [0,0,0,0] except for the first time through this function or some unexpected ERROR
		//we evaluate the answer and proceed to weed out possible codes until we get answer of [4,4] (all positions and colors are correct at answer[4,4]
		evalAnswer();


	}

	

}


/* function to retreive user feedback and remove any elements that don't match*/
function getUserAnswer()
{
	var txt01 = document.getElementById('txt01').value;
	var txt02 = document.getElementById('txt02').value;
	answer=[txt01,txt02];
	evalAnswer();

}

/* function to print next guess to HTML - this will be replaced with better GUI*/
function printGuess () {

		var output = "<h1> My guess: " + guess + " </h1>";
		output = output + "<br> How many did I get correct?<br>"
		output = output + "<input id=\"txt01\" name=\"text001\" type=\"text\" value=\"colors\" /><input id=\"txt02\" name=\"text002\" type=\"text\" value=\"positions\" />";
		output = output + "<button id=\"button002\" onclick=\"getUserAnswer()\">SUBMIT</button>";
		$('#interaction').html(output);
		return 0;
}

/* support function for printing HTML */
function printProcessedGuess () {
		
		var output = "<h2> My guess: " + guess + " </h2>";
		output = output + "<br> Colors correct: " + answer[0] + "<br>";
		output = output + "<br> Positions correct: " + answer[1] + "<br>";
		 $('#old_interaction').append(output);
		 //console.log("check if div id=interaction changed....");
}


//since guess is not the initial value of [0,0,0,0], it must have been changed
//this means we interaacted with the User and we should have user feedback
//note guess can never be [0,0,0,0] except for the first time through this function or some unexpected ERROR
//we evaluate the answer and proceed to weed out possible codes until we get answer of [4,4] (all positions and colors are correct at answer[4,4]
function evalAnswer(){

	var colors=parseInt(answer[0]); 
	var positions=parseInt(answer[1]);
	var positions_correct, colors_correct;


	if (positions == 4 && colors == 4)
	{
		return 1; //we're done
	}
	
	else
	{
			
		// then we filter according to answer
		// first extract unique elements of guess
		var unique=guess.filter(function(itm,i,guess){
		return i==guess.indexOf(itm);
		});

		//remove any codes that do not match color count
		var i = allPossibleCodes.length - 1;
		while (allPossibleCodes[i])
		{

			colors_correct = 0 ; // determines probable answer based on number of colors
			positions_correct = 0; // determines probable answer based on number of positions

			//determine colors_correct
			switch (colors)
			{
			case 0:
				for (var j = 0; j<unique.length ;j++ )
				{
					colors_correct += elementCount (unique[j], allPossibleCodes[i]);
				}
				if (colors_correct > 0)
				{
					//set the variables to remove the code
					colors_correct = 1;
					positions_correct = 2;
					
				}
			break;
				
			case 1: 
				for (var j = 0; j<unique.length ;j++ )
				{
					colors_correct += elementCount (unique[j], allPossibleCodes[i]);
				}
				if (colors_correct > colors)
				{
					//we have to keep this code
					colors_correct = colors;
					
				}
			break;

			case 2: 
				var uniq_count = [];
				// see how many times each unique element of 'guess' appears in 'code'
				for (var j = 0; j<unique.length ;j++ )
				{
					uniq_count[j] = elementCount (unique[j], allPossibleCodes[i]);

				}
				// make copy as not to modify through reference
				// we will splice each element of the copy and compare it to each element in original
				uniq_count_cpy = Object.create(uniq_count);
				var pop_count;
				// do some magic to determine if 'code' should stay or go
				while (uniq_count_cpy.length != 0)
				{
					pop_count = uniq_count_cpy.splice(0,1);
					if (pop_count[0] >= colors)
					{
						//keep this code
						colors_correct = colors;
						break;
					}
					for (var k=0;k<uniq_count.length ;k++ )
					{
						var uniq_count_k = uniq_count[k];
						if (pop_count[0] + uniq_count[k] == colors)
						{
							colors_correct = colors;
							break;

						}
					}
				}



			break;

			case 3:
				var uniq_count = [];
				// see how many times each unique element of 'guess' appears in 'code'
				for (var j = 0; j<unique.length ;j++ )
				{
					uniq_count[j] = elementCount (unique[j], allPossibleCodes[i]);

				}
				// make copy as not to modify through reference
				// we will splice each element of the copy and compare it to each element in original
				uniq_count_cpy = Object.create(uniq_count);
				var pop_count;
				// do some magic to determine if 'code' should stay or go
				while (uniq_count_cpy.length != 0)
				{
					pop_count = uniq_count_cpy.splice(0,1);
					if (pop_count[0] >= colors)
					{
						//keep this code
						colors_correct = colors;
						break;
					}
					for (var k=0;k<uniq_count.length ;k++ )
					{
						var uniq_count_k = uniq_count[k];
						if (pop_count[0] + uniq_count[k] == colors)
						{
							colors_correct = colors;
							break;

						}
					}
				}



			break;


			case 4: 
				//check positions only
				colors_correct = 4;
			break;

			
			}

			// check for acceptable number of positions
			positions_correct += comparePositions(guess, allPossibleCodes[i]);

			//in the following code we determine base on previous analysis if the code stays or goes
			if ((colors_correct != colors || positions_correct != positions) && colors_correct != 0)
			{
				// this line removes codes without potentioal
				var foobar = allPossibleCodes.splice(i,1);
		
			}
			i--;


		}

	//reset guesses
	strategicGuesses = createStrategyGuesses (2);
	var strategicGuesses_len = strategicGuesses.length;
	if (strategicGuesses.length < 20)
	{
		var grab = Math.ceil(Math.random()*3);
		strategicGuesses = createStrategyGuesses (grab);
	
	}
	if (strategicGuesses.length == 0)
	{
		strategicGuesses=allPossibleCodes;

	}

	// print next guess
	printProcessedGuess ();
	guess = strategicGuesses.splice(Math.floor(Math.random()*strategicGuesses.length), 1);
	guess = guess[0];
	printGuess();

	}


}



//function takes array and a single element
// then counts the number of times element occurs in the array
function elementCount (elem, arr) {
	var count = 0;

	for (var i = 0; i < arr.length; i++ )
	{
		//console.log ("arr: " + arr + ", count: " + count + ", elem: " + elem);

		if (elem == arr[i])
		{
			
			count++;
			
		}
	}
	return count;

}

/* function to generate a set of guesses based on the number of unique elements in a code */
function createStrategyGuesses (grab) {
	var guesses = [];
	for (var i=0; i<allPossibleCodes.length ; i++ )
	{
		var temp = allPossibleCodes[i];

		// first extract unique elements of guess
		var unique=temp.filter(function(itm,i,temp){
		return i==temp.indexOf(itm);
		});

		if (unique.length == grab)
		{
			guesses.push(allPossibleCodes[i]);
		}
			
	}

	return guesses;
}

/* function that prints arrays for HTML document */
function printArray(myArray){
	var output = "<br>";
	for(i=0;i<myArray.length;i++)
	{
		output = output + myArray[i] + "<br>";
	}
	document.getElementById("p003").innerHTML = output;
}


/* function that compares arrays */
function compareArrays (arr1, arr2) {
	if (arr1.length != arr2.length)
	{
		console.log ("ERROR: compareArrays(), array lenghts are not equal");
		return 0;
	}
	else
	{
		for (var i = 0; i<arr1.length ;i++ )
		{
			if (arr1[i] != arr2[i])
			{
				return 0;
			}
		}

	}
	return 1;
}

function comparePositions(arr1, arr2) {
	var count = 0;

	for (var i = 0; i < arr1.length; i++ )
	{
		//console.log ("arr: " + arr + ", count: " + count + ", elem: " + elem);

		if (arr1[i] == arr2[i])
		{
			
			count++;
			
		}
	}
	return count;

}
