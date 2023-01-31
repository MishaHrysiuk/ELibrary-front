import { Component, Injector, OnInit } from '@angular/core';
import { AppComponentBase } from '@shared/app-component-base';
import { EntityPropertyChangeDto, EntityChangeListDto, AuditLogServiceProxy } from '@shared/service-proxies/service-proxies';
import * as moment from 'moment';
import { DynamicDialogRef, DynamicDialogConfig } from 'primeng/dynamicdialog';

@Component({
  selector: 'app-entity-change-detail-modal',
  templateUrl: './entity-change-detail-modal.component.html'
})
export class EntityChangeDetailModalComponent extends AppComponentBase implements OnInit {

    active = false;
    entityPropertyChanges: EntityPropertyChangeDto[];
    entityChange: EntityChangeListDto;

    constructor(
        injector: Injector,
        private _auditLogService: AuditLogServiceProxy,
        public ref: DynamicDialogRef,
        public config: DynamicDialogConfig
    ) {
        super(injector);
    }

    ngOnInit(): void {
        this.active = true;
        this.entityChange = this.config.data.changeLog;

        this._auditLogService.getEntityPropertyChanges(this.entityChange.id).subscribe((result) => {
            this.entityPropertyChanges = result;
        });
    }

    getPropertyChangeValue(propertyChangeValue, propertyTypeFullName) {
        if (!propertyChangeValue) {
            return propertyChangeValue;
        }
        propertyChangeValue = propertyChangeValue.replace(/^['"]+/g, '').replace(/['"]+$/g, '');
        if (this.isDate(propertyChangeValue, propertyTypeFullName)) {
            return moment(propertyChangeValue).format('YYYY-MM-DD HH:mm:ss');
        }

        if (propertyChangeValue === 'null') {
            return '';
        }

        return propertyChangeValue;
    }

    isDate(date, propertyTypeFullName): boolean {
        return propertyTypeFullName.includes('DateTime') && !isNaN(Date.parse(date).valueOf());
    }

    close(): void {
        this.ref.close();
        this.active = false;
    }
}
