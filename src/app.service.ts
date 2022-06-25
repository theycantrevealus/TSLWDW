import { Injectable, HttpException, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Cron } from '@nestjs/schedule';
import { Model } from 'mongoose';
import { Report, ReportDocument } from './report.schema';
import { LMS, LMSDocument } from './lms.schema';
import { getCurrentTimestamp, getRunTime, getFromTime } from './utils'
import { Result, ResultDocument } from './result.schema';
require('dotenv').config();

@Injectable()
export class AppService {
  private readonly logger = new Logger(AppService.name);
  private LMSRead: any = {};
  private SLRead: any = {};

  //0 * * * * Hour
  @Cron(`${process.env.CRON_SET}`)
  handleCron () {
    //
  }

  constructor(
    @InjectModel(Report.name) private reportModel: Model<ReportDocument>,
    @InjectModel(Result.name) private resultModel: Model<ResultDocument>,
    @InjectModel(LMS.name) private LMSModel: Model<LMSDocument>
  ) {
    this.logger.debug(`START ${getCurrentTimestamp()}`);
    //SL Management
    this.readFiles(process.env.SL_DIR, 'SL').then((result) => {
      this.SLRead = result['GetData'];

      this.readFiles(process.env.LMS_DIR_RAW, 'LMS').then((resultLMS) => {
        this.LMSRead = resultLMS['GetData'];
        let fileNameList = resultLMS['files'];

        if (fileNameList.length > 0) {
          let addReport = new Report();
          addReport.report_created = getCurrentTimestamp();
          addReport.report_type = 1;
          // this.logger.debug('Preparing Report Master');
          this.add(addReport).then(data => {
            const idReport = data.id;
            // this.logger.debug(`Report Master #${idReport}`);
            fileNameList.map(getFileName => {
              // this.logger.debug(`Logging LMS File ${getFileName}`);
              let LMSDoc = new LMS();
              LMSDoc.report_id = idReport;
              LMSDoc.file_name = getFileName;
              LMSDoc.from_time = getFromTime();
              LMSDoc.run_time = getRunTime();
              const saveLMS = this.add_filename(LMSDoc);
              if (saveLMS) {
                this.moveFiles(process.env.LMS_DIR_RAW, process.env.LMS_DIR_DONE, getFileName);
              }
            });

            // End Loop Safe

            if (
              this.SLRead &&
              Object.keys(this.SLRead).length === 0 &&
              Object.getPrototypeOf(this.SLRead) === Object.prototype
            ) {

            } else {
              for (const a in this.SLRead) {
                let status = '';
                const curSN = this.SLRead[a].sn;

                if (this.LMSRead[`LMS${this.SLRead[a].sn}`] === undefined) {
                  status = 'SL ONLY';
                } else {
                  if (
                    this.SLRead[`SL${curSN}`].sn == this.LMSRead[`LMS${curSN}`].sn &&
                    this.SLRead[`SL${curSN}`].created_at == this.LMSRead[`LMS${curSN}`].created_at &&
                    this.SLRead[`SL${curSN}`].msisdn == this.LMSRead[`LMS${curSN}`].msisdn &&
                    this.SLRead[`SL${curSN}`].denom == this.LMSRead[`LMS${curSN}`].denom &&
                    this.SLRead[`SL${curSN}`].coin == this.LMSRead[`LMS${curSN}`].coin &&
                    this.SLRead[`SL${curSN}`].tier == this.LMSRead[`LMS${curSN}`].tier
                  ) {
                    status = 'Match';
                  } else {
                    status = 'Not Match';
                  }
                }
                // this.logger.debug(`Comparing #LMS-SL ${curSN}`);

                let addResult = new Result();
                addResult.report_id = idReport;
                addResult.sl_denom = this.SLRead[`SL${curSN}`].denom || null;
                addResult.sl_point = this.SLRead[`SL${curSN}`].point || null;
                addResult.sl_tier = this.SLRead[`SL${curSN}`].tier || null;
                addResult.sl_trxtime = this.SLRead[`SL${curSN}`].created_at || null;
                addResult.lms_denom = this.LMSRead[`LMS${curSN}`].denom || null;
                addResult.lms_point = this.LMSRead[`LMS${curSN}`].point || null;
                addResult.lms_tier = this.LMSRead[`LMS${curSN}`].tier || null;
                addResult.lms_trxtime = this.LMSRead[`LMS${curSN}`].created_at || null;
                addResult.status = status;
                this.add_result(addResult);
                // this.logger.error(`Deleting #${curSN}`);
                delete this.SLRead[`SL${curSN}`];
                delete this.LMSRead[`LMS${curSN}`];
              }
            }


            if (
              this.LMSRead &&
              Object.keys(this.LMSRead).length === 0 &&
              Object.getPrototypeOf(this.LMSRead) === Object.prototype
            ) {

            } else {
              for (const a in this.LMSRead) {
                let status = 'LMS ONLY';
                const curSN = this.LMSRead[a].sn;

                // this.logger.debug(`Comparing #SL-LMS ${curSN}`);

                let addResult = new Result();
                addResult.report_id = idReport;
                addResult.sl_denom = null;
                addResult.sl_point = null;
                addResult.sl_tier = null;
                addResult.sl_trxtime = null;
                addResult.lms_denom = this.LMSRead[`LMS${curSN}`].denom || null;
                addResult.lms_point = this.LMSRead[`LMS${curSN}`].point || null;
                addResult.lms_tier = this.LMSRead[`LMS${curSN}`].tier || null;
                addResult.lms_trxtime = this.LMSRead[`LMS${curSN}`].created_at || null;
                addResult.status = status;
                this.add_result(addResult);
                // this.logger.error(`Deleting #${curSN}`);
                delete this.LMSRead[`LMS${curSN}`];
              }
            }

            this.logger.verbose(`DONE!!! ${getCurrentTimestamp()}`);
          });
        }
      });
    });
  }

  async add (report: Report): Promise<Report> {
    const newReport = new this.reportModel(report);
    const saveData = await newReport.save().then(async returning => {
      return await returning
    });

    return saveData;
  }

  async add_filename (lms: LMS): Promise<LMS> {
    const newLMS = new this.LMSModel(lms);
    return newLMS.save();
  }

  async add_result (result: Result): Promise<Result> {
    const newResult = new this.resultModel(result);
    return newResult.save();
  }

  //================================================================================================================================================================
  async moveFiles (from, to, file) {
    // this.logger.debug(`Moving LMS (${file}) from [${from}] to [${to}]`);
    const fs = require('fs');
    if (!fs.existsSync(to)) {
      fs.mkdirSync(to, { recursive: true });
    }

    fs.rename(`${from}/${file}`, `${to}/${file}`, function (err) {
      if (err) throw err
      console.log(`Successfully moved.`)
    })
  }

  async readFiles (location, prefix) {
    const fs = require('fs');
    let LMSData;
    let fileList = [];

    return new Promise(function (resolve, reject) {
      fs.readdir(`${location}`, function (err, filenames) {
        if (filenames.length > 0) {
          fileList = filenames;
          const promises = filenames.map(async FilePath => {
            LMSData = new Promise(function (ok, notOk) {
              let LMSRow = {};
              fs.readFile(`${location}/${FilePath}`, 'utf-8', function (err, content) {
                var rows = content.split(/\r?\n/);
                rows.forEach((row) => {
                  var cell = row.split('|');
                  if (cell[1] !== undefined) {
                    if (LMSRow[`${prefix}${cell[1]}`] === undefined) {
                      LMSRow[`${prefix}${cell[1]}`] = {
                        created_at: '',
                        sn: '',
                        msisdn: '',
                        denom: '',
                        coin: '',
                        tier: ''
                      };
                    }

                    LMSRow[`${prefix}${cell[1]}`].created_at = cell[0];
                    LMSRow[`${prefix}${cell[1]}`].sn = cell[1];
                    LMSRow[`${prefix}${cell[1]}`].msisdn = cell[2];
                    LMSRow[`${prefix}${cell[1]}`].denom = cell[3];
                    LMSRow[`${prefix}${cell[1]}`].coin = cell[4];
                    LMSRow[`${prefix}${cell[1]}`].tier = cell[5];
                  }
                });
                ok(LMSRow);
              });
            });
          });

          LMSData.then(datae => {
            Promise.all(promises)
              .then(async () => {
                resolve({
                  GetData: datae,
                  files: fileList
                });
              });
          });
        } else {
          console.log(`No ${prefix} Found`);
          // reject();
          resolve({
            GetData: {},
            files: []
          });
        }
      });
    });
  }

  getHello (): string {
    return 'Hello World!';
  }
}
