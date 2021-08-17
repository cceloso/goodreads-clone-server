module.exports = () => {
    let io;

    return {
        initialize: (server) => {
            io = require('socket.io')(server, {
                // opts - enable cors
            });

            io.on('connection', (socket) => {
                // make sure to leave room when the component is destroyed or you route to another component

                socket.on("listenToUpdate", (eventName, id) => {
                    const room = `${eventName}-${id}`;
                    socket.join(room, () => console.log(`Socket ${socket.id} joined room ${room}`));
                });

                socket.on("stopListeningToUpdate", (eventName, id) => {
                    const room = `${eventName}-${id}`;
                    socket.leave(room, () => console.log(`Socket ${socket.id} left room ${room}`));
                });

                socket.on("updateNavbar", () => {
                    io.emit("newUserState");
                });

                // console.log(`Socket ${socket.id} has connected`);
            });
        },

        broadcast: (room, event, payload) => {
            // console.log("will broadcast to room:", room);
            io.in(room).emit(event, payload);
        },

        broadcastWithoutRoom: (event, payload) => {
            io.emit(event, payload);
        }
    }
}