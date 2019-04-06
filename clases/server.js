"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const http_1 = __importDefault(require("http"));
const socket_io_1 = __importDefault(require("socket.io"));
const usuario_1 = require("./usuario");
const usuarios_1 = require("./usuarios");
class Server {
    constructor() {
        this.usuariosConectados = new usuarios_1.Usuarios();
        this.app = express_1.default();
        this.httpServer = new http_1.default.Server(this.app);
        this.io = socket_io_1.default(this.httpServer);
        this.puerto = process.env.PORT || 3700;
        this.escucharSockets();
    }
    escucharSockets() {
        //funcion on escucha lo que hace el socket
        //funcion emit: emite un evento
        this.io.on('connect', (cliente) => {
            //al abrir el navegador
            // console.log(`${cliente.id} se ha conectado`);
            // console.log(cliente.id);
            let usuario = new usuario_1.Usuario(cliente.id);
            this.usuariosConectados.agregar(usuario);
            this.io.emit('usuarios-activos', this.usuariosConectados.getLista());
            // console.log("Lista de Usuarios");
            // console.log(this.usuariosConectados.getLista());
            cliente.on('disconnect', () => {
                //borro el usuarrio de la lista de usuarios conectados
                //cuando este se desconecta
                //al cerrar el navegador
                console.log(`${cliente.id} se ha desconectado`);
                this.usuariosConectados.borrarUsuario(cliente.id);
                //emito el eventro de usuarios activos para que todos vean
                //la nueva lista de usuarios activos
                this.io.emit('usuarios-activos', this.usuariosConectados.getLista());
            });
            cliente.on('enviar-mensaje', (payload) => {
                console.log(payload);
                this.io.emit('mensaje-nuevo', payload);
            });
            cliente.on("configurar-usuario", (usuario) => {
                this.usuariosConectados.actualizarNombre(cliente.id, usuario.nombre);
                console.log(this.usuariosConectados.getLista());
            });
            cliente.on("obtener-usuarios", () => {
                console.log("Alguien se ha conectado a la salita");
                // this.io.emit('usuarios-activos',this.usuariosConectados.getLista());
                // this.io.in(cliente.id)  -> emite un socket para un cliente en especifico dado su id
                setTimeout(() => {
                    this.io.emit('usuarios-activos', this.usuariosConectados.getLista());
                }, 1000);
            });
        });
    }
    start() {
        this.httpServer.listen(this.puerto, () => {
            console.log("Servidor iniciado correctamente. Puerto => " + this.puerto);
        });
    }
}
exports.default = Server;
