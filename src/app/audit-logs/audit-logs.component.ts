import { AfterViewInit, Component, Injector, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { appModuleAnimation } from '@shared/animations/routerTransition';
import { AppComponentBase } from '@shared/app-component-base';
import { PrimengTableHelper } from '@shared/helpers/PrimengTableHelper';
import { AuditLogListDto, AuditLogServiceProxy, EntityChangeListDto, NameValueDto } from '@shared/service-proxies/service-proxies';
import * as moment from 'moment';
import { Table } from 'primeng/table';
import { Paginator } from 'primeng/paginator';
import { AuditLogDetailModalComponent } from './audit-log-detail-modal/audit-log-detail-modal.component';
import { EntityChangeDetailModalComponent } from './entity-change-detail-modal/entity-change-detail-modal.component';
import { IErrorState } from './error-state.model';
import { LazyLoadEvent, MenuItem, PrimeIcons } from 'primeng/api';
import { ActivatedRoute } from '@angular/router';
import { DialogService } from 'primeng/dynamicdialog';
import { saveAs } from 'file-saver';
import { Base64Converter } from '@shared/helpers/base64-converter';

@Component({
  templateUrl: './audit-logs.component.html',
  styleUrls: ['./audit-logs.component.less'],
  animations: [appModuleAnimation()],
  encapsulation: ViewEncapsulation.None,
})

export class AuditLogsComponent extends AppComponentBase implements AfterViewInit, OnInit {

  @ViewChild('dataTableAuditLogs', { static: true }) dataTableAuditLogs: Table;
  @ViewChild('paginatorAuditLogs', { static: true }) paginatorAuditLogs: Paginator;
  primengTableHelperAuditLogs = new PrimengTableHelper();

  @ViewChild('dataTableEntityChanges', { static: true }) dataTableEntityChanges: Table;
  @ViewChild('paginatorEntityChanges', { static: true }) paginatorEntityChanges: Paginator;
  primengTableHelperEntityChanges = new PrimengTableHelper();

  //Filters
  public advancedFiltersVisible = false;
  //Dates and Time
  public auditLogStartDate: Date;
  public auditLogEndDate: Date;
  public entityChangeStartDate: Date;
  public entityChangeEndDate: Date;
  public minExecutionDuration: number;
  public maxExecutionDuration: number;
  //Search Inputs
  public usernameAuditLog: string;
  public serviceName: string;
  public methodName: string;
  public browserInfo: string;
  public usernameEntityChange: string;
  //Dropdown
  public errorStates: IErrorState[];
  public hasException: IErrorState;
  public objectTypes: NameValueDto[];
  public entityTypeFullName: NameValueDto;
  //Menu for actions
  public operationLogsItems: MenuItem[];
  public changeLogsItems: MenuItem[];
  public auditLogsItems: MenuItem[];
  public isAuditActionEnabled: boolean;

  constructor(
      injector: Injector,
      private _auditLogService: AuditLogServiceProxy,
      private _activatedRoute: ActivatedRoute,
      private _dialogService: DialogService
  ) {
      super(injector);
      this.usernameAuditLog = this._activatedRoute.snapshot.queryParams['usernameAuditLog'] || '';
  }

  ngOnInit(): void {
      this.errorStates = [
          {name: this.l('HasError'), value: true},
          {name: this.l('Success'), value: false}
      ];
      this.auditLogStartDate = moment().startOf('day').toDate();
      this.entityChangeStartDate = moment().startOf('day').toDate();
      this.auditLogEndDate = moment().endOf('day').toDate();
      this.entityChangeEndDate = moment().endOf('day').toDate();
      this.isAuditActionEnabled = false;
  }

  ngAfterViewInit(): void {
      this.primengTableHelper.adjustScroll(this.dataTableAuditLogs);
      this.primengTableHelper.adjustScroll(this.dataTableEntityChanges);
  }

  getAuditLogsActions(): MenuItem[]{
      this.auditLogsItems = [
          {
              label : this.l('OperationLogs'),
              icon: PrimeIcons.FILE_EXCEL,
              command: () => this.exportToExcelAuditLogs(),
              visible: this.isGranted('Pages.AuditLogs'),
              tooltipOptions: {
                  tooltipLabel: this.l('DownloadOperationLogsInfo'),
                  tooltipPosition: "left",
              }
          },
          {
              label : this.l('ChangeLogs'),
              icon: PrimeIcons.FILE_EXCEL,
              command: () => this.exportToExcelEntityChanges(),
              visible: this.isGranted('Pages.AuditLogs'),
              tooltipOptions: {
                  tooltipLabel: this.l('DownloadChangeLogsInfo'),
                  tooltipPosition: "left",
              }
          },
      ];
      return this.auditLogsItems;
  }

  resetOperationLogs(){
      this.auditLogStartDate = moment().startOf('day').toDate();
      this.auditLogEndDate = moment().endOf('day').toDate();
      this.usernameAuditLog = undefined;
      this.hasException = undefined;
      this.minExecutionDuration = undefined;
      this.maxExecutionDuration = undefined;
      this.serviceName = undefined;
      this.methodName = undefined;
      this.browserInfo = undefined;
  }

  resetChangeLogs(){
      this.entityChangeStartDate = moment().startOf('day').toDate();
      this.entityChangeEndDate = moment().endOf('day').toDate();
      this.usernameEntityChange = undefined;
      this.entityTypeFullName = undefined;
  }

  getAuditLogs(event?: LazyLoadEvent) {
      if (this.primengTableHelperAuditLogs.shouldResetPaging(event)) {
          this.paginatorAuditLogs.changePage(0);
          return;
      }

      this.primengTableHelperAuditLogs.showLoadingIndicator();

      this._auditLogService.getAuditLogs(
          !this.auditLogStartDate === true ? undefined : moment(this.auditLogStartDate),
          !this.auditLogEndDate === true ? undefined : moment(this.auditLogEndDate).endOf('day'),
          this.usernameAuditLog,
          this.serviceName,
          this.methodName,
          this.browserInfo,
          this.hasException?.value ?? undefined,
          this.minExecutionDuration ?? undefined,
          this.maxExecutionDuration ?? undefined,
          this.primengTableHelperAuditLogs.getSorting(this.dataTableAuditLogs),
          this.primengTableHelperAuditLogs.getMaxResultCount(this.paginatorAuditLogs, event),
          this.primengTableHelperAuditLogs.getSkipCount(this.paginatorAuditLogs, event)
      ).subscribe((result) => {
          this.primengTableHelperAuditLogs.totalRecordsCount = result.totalCount;
          this.primengTableHelperAuditLogs.records = result.items;
          this.primengTableHelperAuditLogs.hideLoadingIndicator();
      });
  }

  canUseOperationLogsActions(): boolean {
      return this.isGrantedAny('Pages.AuditLogs');
  }

  getOperationLogsActions(record: AuditLogListDto): MenuItem[]{
      this.operationLogsItems = [
          {label : this.l('ShowDetails'), command: () => this.openOperationLogDetails(record), visible: this.isGranted('Pages.AuditLogs')},
      ];
      return this.operationLogsItems;
  }

  openOperationLogDetails(operationLog: AuditLogListDto){
      this._dialogService.open(AuditLogDetailModalComponent, {
          header: this.l('AuditLogDetail'),
          modal: true,
          data: {
              operationLog: operationLog
          }
      })
  }

  truncateStringWithPostfix(text: string, length: number): string {
      return abp.utils.truncateStringWithPostfix(text, length);
  }

  getEntityChanges(event?: LazyLoadEvent) {
      this._auditLogService.getEntityHistoryObjectTypes()
          .subscribe((result) => {
              this.objectTypes = result;
          });

      if (this.primengTableHelperEntityChanges.shouldResetPaging(event)) {
          this.paginatorEntityChanges.changePage(0);
          return;
      }

      this.primengTableHelperEntityChanges.showLoadingIndicator();

      this._auditLogService.getEntityChanges(
          !this.entityChangeStartDate === true ? undefined : moment(this.entityChangeStartDate),
          !this.entityChangeEndDate === true ? undefined : moment(this.entityChangeEndDate).endOf('day'),
          this.usernameEntityChange,
          this.entityTypeFullName?.value ?? '',
          this.primengTableHelperEntityChanges.getSorting(this.dataTableEntityChanges),
          this.primengTableHelperEntityChanges.getMaxResultCount(this.paginatorEntityChanges, event),
          this.primengTableHelperEntityChanges.getSkipCount(this.paginatorEntityChanges, event)
      ).subscribe((result) => {
          this.primengTableHelperEntityChanges.totalRecordsCount = result.totalCount;
          this.primengTableHelperEntityChanges.records = result.items;
          this.primengTableHelperEntityChanges.hideLoadingIndicator();
      });
  }

  canUseChangeLogsActions(): boolean {
      return this.isGrantedAny('Pages.AuditLogs');
  }

  getChangeLogsActions(record: EntityChangeListDto): MenuItem[]{
      this.operationLogsItems = [
          {label : this.l('ShowDetails'), command: () => this.openChangeLogDetails(record), visible: this.isGranted('Pages.AuditLogs')},
      ];
      return this.operationLogsItems;
  }

  openChangeLogDetails(changeLog: EntityChangeListDto){
      this._dialogService.open(EntityChangeDetailModalComponent, {
          header: this.l('Details'),
          modal: true,
          data: {
              changeLog: changeLog
          }
      })
  }

  exportToExcelAuditLogs(): void {
      this.isAuditActionEnabled = true;

      this._auditLogService.getAuditLogsToExcel(
          !this.auditLogStartDate === true ? undefined : moment(this.auditLogStartDate),
          !this.auditLogEndDate === true ? undefined : moment(this.auditLogEndDate).endOf('day'),
          this.usernameAuditLog,
          this.serviceName,
          this.methodName,
          this.browserInfo,
          this.hasException?.value ?? undefined,
          this.minExecutionDuration ?? undefined,
          this.maxExecutionDuration ?? undefined,
          undefined,
          1,
          0).subscribe(result => {
              var blob = Base64Converter.base64toBlob(result.context, result.fileType);
              saveAs(blob, result.fileName);

              this.isAuditActionEnabled = false;
          });
  }

  exportToExcelEntityChanges(): void {
      this.isAuditActionEnabled = true;

      this._auditLogService.getEntityChangesToExcel(
          !this.entityChangeStartDate === true ? undefined : moment(this.entityChangeStartDate),
          !this.entityChangeEndDate === true ? undefined : moment(this.entityChangeEndDate).endOf('day'),
          this.usernameEntityChange,
          this.entityTypeFullName?.value ?? '',
          undefined,
          1,
          0)
          .subscribe(result => {
              var blob = Base64Converter.base64toBlob(result.context, result.fileType);
              saveAs(blob, result.fileName);

              this.isAuditActionEnabled = false;
          });
  }
}
