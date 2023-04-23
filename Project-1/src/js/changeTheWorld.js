/*
 * Zaki Bonfoh
 * changeTheWorld.js
 * October 17, 2019
 * This file contains the code used to make the game interactive
 */

var storyContainer = document.getElementById("ctw-story");
var form = document.getElementById("ctw-form");

// Tell the story function
function tellStory(param) {

    // Form elements
    var txtAdjective1 = document.getElementById("txtAdjective1"),
        txtVerb = document.getElementById("txtVerb"),
        txtNoun1 = document.getElementById("txtNoun1"),
        txtNoun2 = document.getElementById("txtNoun2"),
        txtNoun3 = document.getElementById("txtNoun3"),
        txtNoun4 = document.getElementById("txtNoun4"),
        txtAdjective2 = document.getElementById("txtAdjective2"),
        txtAdjective3 = document.getElementById("txtAdjective3");

    // Variable for inputs
    var adjective1 = txtAdjective1.value,
        adjective2 = txtAdjective2.value,
        adjective3 = txtAdjective3.value,
        verb = txtVerb.value,
        noun1 = txtNoun1.value,
        noun2 = txtNoun2.value,
        noun3 = txtNoun3.value,
        noun4 = txtNoun4.value;

    if(!param) { // Tell the story

        var story;

        if(adjective1 && adjective2 && adjective3 && noun1 && noun2 && noun3 && noun4 && verb) { // If all fields are filled in

            // Write the story
            story = `<div class="ctw-story-title">Story:</div>`;
            story += `The truth is, it is ${adjective1} to change the world. <br/> But to change the world, you have to ${verb} yourself first.<br/> You have to change your ${noun1}, your ${noun2}, and your ${noun3}.<br/> It's not ${adjective2} changing yourself, but it's ${adjective3} if you want to make a massive ${noun4} for the world!`;

            // Output the story
            storyContainer.innerHTML = story;

            // Show the story container and hide the form
            show(storyContainer);
            hide(form);

        } else { // If there's one empty field or more

            // Output the warning
            story = `<div class="ctw-story-title" style="margin-bottom: 0; text-align: center; font-size: 16px;">You have to fill in all fields</div>`;
            storyContainer.innerHTML = story;

            // Show the story container
            show(storyContainer);

        }

    } else { // Reset

        var fields = [txtAdjective1, txtAdjective2, txtAdjective3, txtVerb, txtNoun1, txtNoun2, txtNoun3, txtNoun4];

        // Empty all fields
        for(field of fields) {
            field.value = '';
        }

        // Hide the story container and show the form
        hide(storyContainer);
        show(form);

    }

}

// Hide an element
function hide(element) { element.setAttribute('style', 'display:none;'); }
// Show an element
function show (element) { element.setAttribute('style', 'display:block;'); }

