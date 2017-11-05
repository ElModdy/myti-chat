var socket;
function logout(){
  $.ajax({
    type: "GET",
    url: "/logout",
    success: callback
  });
}


function login(){
  $.ajax({
    type: "GET",
    url: "/login",
    success: callback
  });
}

function callback(data){

  if(data == "Login failed"){
    $("#loginError").empty().append("<strong>Error!</strong> Login failed");
    $("#loginError").show();
  }else{
    var classes = 'col-sm-8 col-sm-offset-2 col-lg-4 col-lg-offset-4';
    $('#wrapper').fadeOut('slow', function() {
      $('#wrapper').empty().append(data);
      if(data.indexOf("sambossino") != -1){
        socket = io.connect({'forceNew': true});
        socket.on('chat message', function(msg){
          console.log("messaggio arrivato");
          $('#messages').append($('<li>').text(msg));
          $('#scrollable-content').scrollTop($('#scrollable-content').prop("scrollHeight"));
        });
        $('#wrapper').removeClass(classes);
      }else {
         socket.disconnect();
        $('#wrapper').addClass(classes);
      }
      $('#wrapper').fadeIn('slow');
    });
  }
}
$(document).on("submit", "form", function (e) {
  console.log("FUNZIONNAAAAAAAAA");
  var oForm = $(this);
  var formId = oForm.attr("id");
  switch (formId) {
    case "registerForm":
      console.log("REGISTER CLICCATO");
      e.preventDefault();

      var passConf = $('#inputPasswordConfirm').val();
      var pass = $('#inputPasswordReg').val();
      if(pass != passConf){
        $("#registerError").empty().append("<strong>Error!</strong> passwords must be the same.");
        $("#registerError").show();
      }else
        $.ajax({
          type: "POST",
          url: "/",
          data: $('#registerForm').serialize(),
          success: callback
        });
      break;
    case "loginForm":
      e.preventDefault();

      $.ajax({
        type: "POST",
        url: "/",
        data: $('#loginForm').serialize(),
        success: callback
      });
      break;
    case "chatForm":
      if($(".identificator").length){
        e.preventDefault();

        console.log("CHAT FORM CLICCATO");
        socket.emit('chat message', $('#m').val());
        $('#m').val('');
      }
      break;
  }
  return false;
});

$(function(){
  if($(".identificator").length){
    socket = io.connect({'forceNew': true});
    socket.on('chat message', function(msg){
      console.log("messaggio arrivato");
      $('#messages').append($('<li>').text(msg));
      $('#scrollable-content').scrollTop($('#scrollable-content').prop("scrollHeight"));
    });
  }
});
