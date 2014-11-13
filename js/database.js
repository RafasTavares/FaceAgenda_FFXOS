var db = openDatabase(
    'semex',
    '1.0',
    'Banco de dados referente ao armazenamento mobile dos amigos',
    2 * 1024 * 1024
);

function listarAmigos() {
  db.transaction( function (tx) {
     tx.executeSql('CREATE TABLE IF NOT EXISTS amigos (id integer primary key autoincrement, nome, usuario, telefone, email, sexo, endereco, bairro, cidade, estado, pais, foto)', [],
      function () {
        tx.executeSql('SELECT * FROM amigos ORDER BY nome', [],
          function (tx, results) {
            var quant = results.rows.length;
            var list = $("#dataList");
            list.empty().listview('refresh');
            for (var i = 0; i < quant; i++) {
              var amigo = results.rows.item(i);
              var li = document.createElement('li');
              
              var a = document.createElement('a');
              a.setAttribute('href', '#');
              a.setAttribute('onClick', 'visualizarAmigo(' + amigo.id + ')');
              a.innerHTML = "<img src='" + amigo.foto + "' /><h2 class='" + amigo.sexo + "'>" + amigo.nome + "</h2><p>" + amigo.usuario + "</p>";

              li.appendChild(a);
              list.append(li);
            }
            list.listview('refresh');

            $.mobile.changePage("#listaAmigos");
          },
          function (tx, error) {
            alert('Ops.. ' + error.message);
          });
      });
  });
}

listarAmigos();

function visualizarAmigo (id) {
  db.transaction(function (tx) {
    tx.executeSql('SELECT * FROM amigos WHERE id = ? LIMIT 1', [id], function(tx, results) {
      var amigo = results.rows.item(0);

      var endereco = $("#endereco"),
          bairro = $("#bairro"),
          cidade = $("#cidade"),
          estado = $("#estado"),
          pais = $("#pais");

      $('#foto').prop('src', amigo.foto);
      $('#id').val(amigo.id);
      $('#nome').val(amigo.nome);
      $('#usuario').val(amigo.usuario);
      $('#email').val(amigo.email);
      $('#telefone').val(amigo.telefone).focus();
      endereco.val(amigo.endereco);
      bairro.val(amigo.bairro);
      cidade.val(amigo.cidade);
      estado.val(amigo.estado);
      pais.val(amigo.pais);
      $("#map").empty();

      $(document).on("change", "#endereco, #bairro, #cidade, #estado, #pais", function() {
        loadAddress(endereco.val(), bairro.val(), cidade.val(), estado.val(), pais.val());
      });

      loadAddress(endereco.val(), bairro.val(), cidade.val(), estado.val(), pais.val());

      $.mobile.changePage("#editarAmigo");
    }, function (tx, error) {
      alert('Ops... ' + error.message);
    });
  });
}

function loadAddress(endereco, bairro, cidade, estado, pais) {
  if (endereco !== "" && bairro !== "" && cidade !== "" && estado !== "" && pais !== "") {
    var address = endereco + " " + bairro + ", " + cidade + " " + estado + " - " + pais;
    $.getJSON("http://maps.googleapis.com/maps/api/geocode/json?address=" + address + "&sensor=false", function(result) {
      if (result.results.length > 0) {
        var lat = result.results[0].geometry.location.lat,
            lng = result.results[0].geometry.location.lng;

        initialize(lat, lng);
      }
    });
  }
}

function novoAmigo() {
  $('#facebook').val("").focus();
  $.mobile.changePage("#novoAmigo");
}

function adicionarAmigo () {
  var user = $('#facebook').val();

  $.getJSON("https://graph.facebook.com/" + user, function(json) {
    $.getJSON("https://graph.facebook.com/" + user + "/picture?type=large&height=200&redirect=false", function(picture) {
      db.transaction(function (tx) {
        tx.executeSql("INSERT INTO amigos (nome, usuario, sexo, foto) VALUES (?, ?, ?, ?)",
          [json.name, json.username, json.gender, picture.data.url], function(tx, result) {

          visualizarAmigo(result.insertId);
        });
      }, function (tx, error) {
        alert('Ops... ' + error.message);
      });
    });
  }).fail(function() {
    alert("Usuário inválido");
  });
}

function atualizarAmigo() {
  var id = $('#id').val();
  var email = $('#email').val();
  var telefone = $('#telefone').val();
  var endereco = $('#endereco').val();
  var bairro = $('#bairro').val();
  var cidade = $('#cidade').val();
  var estado = $('#estado').val();
  var pais = $('#pais').val();

  db.transaction(function (tx) {
    tx.executeSql("UPDATE amigos SET telefone = ?, email = ?, endereco = ?, bairro = ?, cidade = ?, estado = ?, pais = ? WHERE id = ?",
      [telefone, email, endereco, bairro, cidade, estado, pais, id]);
    
    alert("Amigo atualizado com sucesso!");
    listarAmigos();
  }, function (tx, error) {
    alert('Ops... ' + error.message);
  });
}

function removerAmigo() {
  var id = $('#id').val();

  db.transaction(function (tx) {
    tx.executeSql("DELETE FROM amigos WHERE id = ?", [id], function() {
      alert("Amigo removido com sucesso!");
      listarAmigos();
    });
  });
}