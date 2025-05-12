import Mustache from 'mustache';
import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';
import dayjs from 'dayjs';
import { AggregatedMonthlyReport, RenderPDFDataInput, GeneratePDFInput } from '../types';
import {
  monthlyBudgetReportCSS,
  reportTitle,
  monthlyBudgetReportTemplate,
} from '../consts';

export const generateMonthlyPDFReport = (
  inputData: AggregatedMonthlyReport,
  YYYYMM: string,
) => {
  if (!inputData) {
    throw new Error('Monthly Data is required');
  }

  if (!YYYYMM) {
    throw new Error('YYYYMM is required');
  }

  const reportDate = dayjs(YYYYMM).format('MMMM');

  enrichDataForReport(inputData, reportDate);
};

export const enrichDataForReport = async (
  inputTemplateData: AggregatedMonthlyReport,
  reportDate: string,
) => {
  const renderPDFInput: RenderPDFDataInput = {
    reportDate,
    templateData: inputTemplateData,
    templateStyleSheet: monthlyBudgetReportCSS,
    reportName: reportTitle,
  };

  renderPDF(renderPDFInput);
};

// Add in some metadata around template type and the data type, throw error if the data can not be coupled with template type
export const renderPDF = async (renderPDFDataInput: RenderPDFDataInput) => {
  const { reportDate, templateData, templateStyleSheet, reportName } =
  renderPDFDataInput;

  try {
    const templateContents = fs.readFileSync(
      path.resolve(
        `./src/server/utils/pdfgenerator/templates/${monthlyBudgetReportTemplate}`,
      ),
      'utf8',
    );

    const htmlString = Mustache.render(templateContents, templateData, {
      stylesheet: fs.readFileSync(
        path.resolve(
          `./src/server/utils/pdfgenerator/templates/assets/css/${templateStyleSheet}`,
        ),
        'utf8',
      ),
    });
    
    const generatePDFinput: GeneratePDFInput = {
        htmlString,
        reportDate,
        reportName,
    }

    await generatePDF(generatePDFinput);
  } catch (error) {
    console.log(error);
  }
};

const generatePDF = async (
    generatePDFInput: GeneratePDFInput
) => {
    const { htmlString, reportDate, reportName } = generatePDFInput;
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.setContent(htmlString);
  await page.setViewport({ width: 1, height: 1 });
  await page.emulateMediaType('screen');
  await page.pdf({
    path: `./${reportDate}-${reportName}.pdf`,
  });
  await browser.close();
};
