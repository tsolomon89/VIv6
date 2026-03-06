import Handlebars from 'handlebars';
import fs from 'fs-extra';
import path from 'path';

// Helper to register all partials in the sections directory
export async function registerPartials(templatesDir: string) {
  const sectionsDir = path.join(templatesDir, 'sections');
  
  if (await fs.pathExists(sectionsDir)) {
    const files = await fs.readdir(sectionsDir);
    for (const file of files) {
      if (file.endsWith('.hbs')) {
        const name = path.parse(file).name;
        const content = await fs.readFile(path.join(sectionsDir, file), 'utf-8');
        Handlebars.registerPartial(name, content);
      }
    }
  }
}

export async function renderTemplate(templatePath: string, data: any): Promise<string> {
  const content = await fs.readFile(templatePath, 'utf-8');
  const template = Handlebars.compile(content);
  return template(data);
}

export async function renderLayout(layoutPath: string, bodyContent: string, data: any): Promise<string> {
  const content = await fs.readFile(layoutPath, 'utf-8');
  const template = Handlebars.compile(content);
  return template({ ...data, body: bodyContent });
}
