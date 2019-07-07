/***************************************************************************
vanilla_jquery.js

This file uses jQuery to provide autocomplete for searches on the site.

Created by: Mark Hardy
Last Updated: 4/24/2019
***************************************************************************/

  $( function() {
 
    // Input field must have an id of "search" for this function to work
    $( "#search" ).autocomplete({
      minLength: 3,
      source: "https://wikivanilla.herokuapp.com/autocomplete",
      focus: function( event, ui ) {
        $( "#search" ).val( ui.item.name );
        return false;
      },
      select: function( event, ui ) {
        $( "#search" ).val( ui.item.name );
        $( "#search-id" ).val( ui.item.entry );
        $( "#search-description" ).html( ui.item.Quality );
        $( "#project-icon" ).attr( "src", "icons/" + ui.item.displayid );
 
        return false;
      }
    })
    .autocomplete( "instance" )._renderItem = function( ul, item ) {
      return $( "<li>" )
        // The HTML for each suggested search term as a <li> elements
        .append( "<div class='autocomplete-cell'><img width=30px height=30px src='icons/" + item.icon1 + ".png" + "' " + 
          "</img><a href='https://wikivanilla.herokuapp.com/" + item.type + ".html?" + item.type + "=" + item.entry + "' style='color:" + 
          item.Quality + "' data-wowhead='" + item.type + "=" + item.entry + "&amp;domain=classic'>" + item.name + "</a>" + 
          "<div class='push-right'>" + item.type + "</div></div>" )
        .appendTo( ul );
    };
  } );