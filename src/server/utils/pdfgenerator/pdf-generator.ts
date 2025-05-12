import Mustache from 'mustache';
import puppeteer from "puppeteer";
import fs from 'fs';
import path from "path";
import { AggregatedMonthlyReport } from '../types';

//TestPDFData
type RenderPDFDataInput = {
  templateType: string,
  templateData: AggregatedMonthlyReport,
  templateStyleSheet: string,
  reportName: string
}

export const generateMonthlyPDFReport = (templateType: AggregatedMonthlyReport) => {
    if(!templateType){
      throw new Error('Template data or type is required');
    }

    enrichDataForReport("monthly", templateType)
}

//TODO: CONSTS
const monthlyBudgetReportCSS = 'monthlyReportStyleSheet.css'
const monthlyBudgetReportTemplate = 'monthlyBudgetSummary.mustache'
const reportTitle = 'monthly-expense-report' // add variable for month name

export const enrichDataForReport = async (templateType: string, inputTemplateData: AggregatedMonthlyReport) => {

    const renderPDFInput: RenderPDFDataInput = {
      templateType,
      templateData: inputTemplateData,
      templateStyleSheet: monthlyBudgetReportCSS,
      reportName: reportTitle,
    }
  
    console.log('Data', JSON.stringify(inputTemplateData))
    
    renderPDF(renderPDFInput)
}

// Add in some metadata around template type and the data type, throw error if the data can not be coupled with template type
export const renderPDF = async (RenderPDFDataInput: RenderPDFDataInput) => {
    const { templateData, templateStyleSheet, reportName } = RenderPDFDataInput

    try {
        const templateContents = fs.readFileSync(path.resolve(`./src/server/utils/pdfgenerator/templates/${monthlyBudgetReportTemplate}`), "utf8");

        const htmlString = Mustache.render( templateContents, templateData, {
            stylesheet: fs.readFileSync(path.resolve(`./src/server/utils/pdfgenerator/templates/assets/css/${templateStyleSheet}`), "utf8")
        } );

        (async () => {
        const browser = await puppeteer.launch();
        const page = await browser.newPage();
        await page.setContent(htmlString);
        await page.setViewport({ width: 1, height: 1 });
        await page.emulateMediaType('screen')
        await page.pdf({
            path:`./${reportName}.pdf`
        })
        await browser.close();
        })();
    } catch (error) {
        console.log(error);
    }
}