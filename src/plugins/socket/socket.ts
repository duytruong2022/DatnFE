import io, { Socket } from 'socket.io-client';

export const SocketEvents = {
    CONNECT: 'connect',
    DISCONNECT: 'disconnect',
    WEB_APP_USER_LOGIN: 'web_app_user_login',
    WEB_APP_SUPPORT_REQUEST_EXPORT_CSV: 'web_app_support_request_export_csv',
};

const SOCKET_BASE_URL = process.env.VUE_APP_SOCKET_SERVER_URL as string;
let socket: Socket;

interface ISocketWepAppLogin {
    senderId: string;
    senderEmail: string;
}

interface IExportCSVData {
    fileName: string;
    filePath: string;
}

type SocketSubscribeReceiveSupportRequestExportCSVCallback = (
    message: IExportCSVData,
) => void;

export default {
    getSocket(): Socket {
        return socket;
    },
    connect(info: ISocketWepAppLogin): void {
        if (socket) {
            this.login(info);
        } else {
            socket = io(SOCKET_BASE_URL, {
                reconnection: true,
            });
            if (info?.senderId) this.login(info);
        }
    },
    disconnect(): void {
        if (socket) {
            socket.disconnect();
        }
    },
    login(info: ISocketWepAppLogin): void {
        if (socket) {
            socket.emit(SocketEvents.WEB_APP_USER_LOGIN, info);
        }
    },
    // receive onvif profile
    subscribeReceiveSupportRequestExportCSVData(
        listener: SocketSubscribeReceiveSupportRequestExportCSVCallback,
    ): void {
        if (socket) {
            socket.on(
                SocketEvents.WEB_APP_SUPPORT_REQUEST_EXPORT_CSV,
                (result: IExportCSVData) => {
                    listener(result);
                },
            );
        }
    },
};
