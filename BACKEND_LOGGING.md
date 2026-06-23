
# 📝 Especificación de Logging para Backend (NestJS)

Esta configuración debe implementarse en el `Repo 1 (backend-enfermeria-pae)` para garantizar logs estructurados JSON compatibles con la especificación de observabilidad.

## Stack Recomendado
*   **Librería Principal:** `winston`
*   **Integración NestJS:** `nest-winston`

## 1. Instalación
```bash
npm install --save nest-winston winston
```

## 2. Configuración (src/main.ts)

Sustituir el logger por defecto de NestJS para usar Winston y formatear todo como JSON.

```typescript
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { WinstonModule } from 'nest-winston';
import * as winston from 'winston';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: WinstonModule.createLogger({
      transports: [
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.ms(),
            winston.format.json() // OUTPUT EN JSON OBLIGATORIO
          ),
        }),
        // Opcional: Rotación de ficheros
        // new winston.transports.File({ filename: 'error.log', level: 'error' }),
      ],
    }),
  });
  await app.listen(3000);
}
bootstrap();
```

## 3. Uso en Servicios (Ejemplo AuthService)

Los logs deben incluir contexto y metadatos relevantes.

```typescript
import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  async validateUser(email: string, pass: string): Promise<any> {
    this.logger.log(`Validating user attempt: ${email}`); // Info level

    const user = await this.usersService.findOne(email);
    if (!user) {
      this.logger.warn(`Login failed: User not found`, { email }); // Warn level + Meta
      return null;
    }
    
    // ... password check ...
    
    // Audit Log (Critical Action)
    this.logger.log({
        message: 'User logged in successfully',
        action: 'LOGIN_SUCCESS',
        userId: user.id,
        ip: '127.0.0.1' // Obtener de request real
    });

    return result;
  }
}
```

## 4. Estructura del Log Resultante (JSON)

Cada línea de log en la consola de producción tendrá este formato exacto:

```json
{
  "context": "AuthService",
  "level": "info",
  "message": "User logged in successfully",
  "timestamp": "2024-05-20T10:30:00.000Z",
  "action": "LOGIN_SUCCESS",
  "userId": "uuid-1234",
  "ip": "127.0.0.1",
  "ms": "+5ms"
}
```

## 5. Captura de Excepciones Globales (src/common/filters/all-exceptions.filter.ts)

Asegurar que los errores 500 no controlados también salgan en JSON.

```typescript
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger('HTTP');

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const request = ctx.getRequest();
    const status = exception instanceof HttpException ? exception.getStatus() : 500;

    const logData = {
      level: 'error',
      message: 'Unhandled Exception',
      statusCode: status,
      path: request.url,
      method: request.method,
      error: exception instanceof Error ? exception.stack : exception,
    };

    this.logger.error(JSON.stringify(logData)); // Log estructurado
    
    // ... response logic ...
  }
}
```
