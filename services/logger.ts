
/**
 * Structured Logger Service
 * 
 * Generates JSON logs compatible with standard observability tools (Datadog, CloudWatch, ELK).
 * This structure mirrors the Backend NestJS logger configuration.
 */

export type LogLevel = 'info' | 'warn' | 'error' | 'debug';

export interface LogEntry {
    timestamp: string;
    level: LogLevel;
    context: string;
    message: string;
    metadata?: Record<string, any>;
    environment: string;
}

class LoggerService {
    private isProduction = process.env.NODE_ENV === 'production';

    private createEntry(level: LogLevel, context: string, message: string, metadata?: any): LogEntry {
        return {
            timestamp: new Date().toISOString(),
            level,
            context,
            message,
            metadata,
            environment: process.env.NODE_ENV || 'development'
        };
    }

    private print(entry: LogEntry) {
        // En producción, esto se enviaría a un servicio de ingestión de logs (ej: /api/logs)
        // En desarrollo, se muestra en consola formateado
        const logString = JSON.stringify(entry);
        
        if (entry.level === 'error') {
            console.error(logString);
        } else if (entry.level === 'warn') {
            console.warn(logString);
        } else {
            console.log(logString);
        }
    }

    info(context: string, message: string, metadata?: any) {
        this.print(this.createEntry('info', context, message, metadata));
    }

    warn(context: string, message: string, metadata?: any) {
        this.print(this.createEntry('warn', context, message, metadata));
    }

    error(context: string, message: string, trace?: any, metadata?: any) {
        this.print(this.createEntry('error', context, message, { ...metadata, trace }));
    }

    // Specific Security Audit Log
    audit(action: string, userId: string, details: any) {
        this.print(this.createEntry('info', 'AuditLog', `User Action: ${action}`, {
            userId,
            action,
            ...details,
            isAudit: true
        }));
    }
}

export const logger = new LoggerService();
