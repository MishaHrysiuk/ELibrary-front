import { Component, Injector, OnInit } from '@angular/core';
import { AppComponentBase } from '@shared/app-component-base';
import { AuditLogListDto } from '@shared/service-proxies/service-proxies';
import * as moment from 'moment';
import { DynamicDialogRef, DynamicDialogConfig } from 'primeng/dynamicdialog';

@Component({
  selector: 'app-audit-log-detail-modal',
  templateUrl: './audit-log-detail-modal.component.html'
})
export class AuditLogDetailModalComponent extends AppComponentBase implements OnInit {

    active = false;
    auditLog: AuditLogListDto;

    constructor(
        injector: Injector,
        public ref: DynamicDialogRef,
        public config: DynamicDialogConfig
    ) {
        super(injector);
    }

    ngOnInit(): void {
        this.active = true;
        this.auditLog = this.config.data.operationLog;
    }

    getExecutionTime(): string {
        const self = this;
        return moment(self.auditLog.executionTime).fromNow() + ' (' + moment(self.auditLog.executionTime).format('YYYY-MM-DD HH:mm:ss') + ')';
    }

    getDurationAsMs(): string {
        const self = this;
        return self.l('Xms', self.auditLog.executionDuration);
    }

    getFormattedParameters(): string {
        const self = this;
        try {
            const json = JSON.parse(self.auditLog.parameters);
            return JSON.stringify(json, null, 4);
        } catch (e) {
            return self.auditLog.parameters;
        }
    }

    close(): void {
        this.ref.close();
        this.active = false;
    }
}
