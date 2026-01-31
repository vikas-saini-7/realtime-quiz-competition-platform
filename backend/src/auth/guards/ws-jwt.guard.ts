import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { WsException } from '@nestjs/websockets';
import { AuthService } from '../auth.service';
import { Socket } from 'socket.io';

@Injectable()
export class WsJwtGuard implements CanActivate {
  constructor(private readonly authService: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const client: Socket = context.switchToWs().getClient();
    const token = this.extractToken(client);

    if (!token) {
      throw new WsException('Unauthorized: No token provided');
    }

    const user = await this.authService.validateToken(token);
    if (!user) {
      throw new WsException('Unauthorized: Invalid token');
    }

    // Attach user to socket data
    client.data.user = user;
    return true;
  }

  private extractToken(client: Socket): string | null {
    // Try to get token from handshake auth
    const authToken = client.handshake.auth?.token;
    if (authToken) {
      return authToken.replace('Bearer ', '');
    }

    // Fallback to query parameter
    const queryToken = client.handshake.query?.token;
    if (queryToken && typeof queryToken === 'string') {
      return queryToken.replace('Bearer ', '');
    }

    // Fallback to authorization header
    const authHeader = client.handshake.headers?.authorization;
    if (authHeader) {
      return authHeader.replace('Bearer ', '');
    }

    return null;
  }
}
