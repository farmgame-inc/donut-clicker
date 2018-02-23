module.exports = function(io) {
    io.on('connection', function (socket) {
            // On envoie le nombre de personnes actuellement sur le socket à tout le monde (sauf la personne qui vient de se connecter)
            socket.broadcast.emit('UserState', io.engine.clientsCount);
            // On envoie le nombre de personnes actuellement sur le socket à la personne qui vient de se connecter
            socket.emit('UserState', io.engine.clientsCount);

             socket.on('disconnect', function () {
              // On prévient tout le monde qu'une personne s'est deconnectée
                socket.broadcast.emit('UserState', io.engine.clientsCount);
            });
    });
};