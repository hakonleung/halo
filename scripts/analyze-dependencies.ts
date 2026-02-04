#!/usr/bin/env tsx

/**
 * Dependency Analysis Script
 * Analyzes TypeScript/TSX files to find unused exports
 *
 * Usage: pnpm tsx scripts/analyze-dependencies.ts
 */

import * as fs from 'fs';
import * as path from 'path';

import { Project } from 'ts-morph';

interface ExportInfo {
  file: string;
  name: string;
  line: number;
  type: 'function' | 'class' | 'type' | 'interface' | 'enum' | 'const' | 'variable';
}

interface ImportInfo {
  file: string;
  from: string;
  name: string;
}

// Get all TS/TSX files
function getAllTsFiles(dir: string, fileList: string[] = []): string[] {
  const files = fs.readdirSync(dir);

  files.forEach((file) => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      // Skip node_modules, .next, etc.
      if (
        !file.startsWith('.') &&
        file !== 'node_modules' &&
        file !== '.next' &&
        file !== 'dist' &&
        file !== 'build'
      ) {
        getAllTsFiles(filePath, fileList);
      }
    } else if (file.endsWith('.ts') || file.endsWith('.tsx')) {
      fileList.push(filePath);
    }
  });

  return fileList;
}

// Check if file is in app directory (page files)
function isPageFile(filePath: string): boolean {
  const appDir = path.join(process.cwd(), 'src', 'app');
  return (
    filePath.startsWith(appDir) && (filePath.endsWith('page.tsx') || filePath.endsWith('route.ts'))
  );
}

async function analyzeDependencies() {
  const project = new Project({
    tsConfigFilePath: path.join(process.cwd(), 'tsconfig.json'),
  });

  const srcDir = path.join(process.cwd(), 'src');
  const allFiles = getAllTsFiles(srcDir);
  const sourceFiles = allFiles.map((file) => project.addSourceFileAtPath(file));

  const exports: ExportInfo[] = [];
  const imports: ImportInfo[] = [];
  const pageFiles: string[] = [];

  // Collect all exports
  sourceFiles.forEach((sourceFile) => {
    const filePath = sourceFile.getFilePath();

    if (isPageFile(filePath)) {
      pageFiles.push(filePath);
    }

    // Get exported declarations
    sourceFile.getExportedDeclarations().forEach((declarations, name) => {
      declarations.forEach((decl) => {
        const line = decl.getStartLineNumber();
        let type: ExportInfo['type'] = 'variable';

        if (decl.getKindName().includes('Function')) {
          type = 'function';
        } else if (decl.getKindName().includes('Class')) {
          type = 'class';
        } else if (decl.getKindName().includes('TypeAlias')) {
          type = 'type';
        } else if (decl.getKindName().includes('Interface')) {
          type = 'interface';
        } else if (decl.getKindName().includes('Enum')) {
          type = 'enum';
        } else if (decl.getKindName().includes('Variable')) {
          type = 'const';
        }

        exports.push({
          file: filePath,
          name,
          line,
          type,
        });
      });
    });

    // Get imports
    sourceFile.getImportDeclarations().forEach((importDecl) => {
      const moduleSpecifier = importDecl.getModuleSpecifierValue();
      const namedImports = importDecl.getNamedImports();

      namedImports.forEach((namedImport) => {
        const importName = namedImport.getName();
        imports.push({
          file: filePath,
          from: moduleSpecifier,
          name: importName,
        });
      });
    });
  });

  // Find unused exports
  // An export is unused if it's not imported by any page file or any file that's imported by a page file
  const usedExports = new Set<string>();
  const filesToCheck = new Set(pageFiles);
  const checkedFiles = new Set<string>();

  // BFS: Start from page files and trace all imports
  while (filesToCheck.size > 0) {
    const currentFile = Array.from(filesToCheck)[0];
    filesToCheck.delete(currentFile);
    checkedFiles.add(currentFile);

    // Find all imports in this file
    const fileImports = imports.filter((imp) => imp.file === currentFile);

    fileImports.forEach((imp) => {
      // Resolve import path
      const importPath = resolveImportPath(imp.from, currentFile);
      if (importPath && !checkedFiles.has(importPath)) {
        filesToCheck.add(importPath);
      }

      // Mark this export as used
      const exportKey = `${importPath || imp.from}:${imp.name}`;
      usedExports.add(exportKey);
    });
  }

  // Find unused exports
  const unusedExports: ExportInfo[] = [];

  exports.forEach((exp) => {
    const exportKey = `${exp.file}:${exp.name}`;
    if (!usedExports.has(exportKey)) {
      // Check if it's exported from an index file
      const indexExportKey = `${path.dirname(exp.file)}/index:${exp.name}`;

      if (!usedExports.has(indexExportKey)) {
        unusedExports.push(exp);
      }
    }
  });

  // Generate report
  console.log('\n=== Dependency Analysis Report ===\n');
  console.log(`Total exports: ${exports.length}`);
  console.log(`Used exports: ${usedExports.size}`);
  console.log(`Unused exports: ${unusedExports.length}\n`);

  if (unusedExports.length > 0) {
    console.log('Unused Exports:\n');
    const grouped: Record<string, ExportInfo[]> = {};
    unusedExports.forEach((exp) => {
      if (!grouped[exp.file]) {
        grouped[exp.file] = [];
      }
      grouped[exp.file].push(exp);
    });

    Object.entries(grouped).forEach(([file, exps]) => {
      const relativePath = path.relative(process.cwd(), file);
      console.log(`\n${relativePath}:`);
      exps.forEach((exp) => {
        console.log(`  - ${exp.name} (${exp.type}) at line ${exp.line}`);
      });
    });
  } else {
    console.log('✅ No unused exports found!');
  }

  console.log('\n=== End of Report ===\n');
}

function resolveImportPath(importPath: string, fromFile: string): string | null {
  // Handle relative imports
  if (importPath.startsWith('.')) {
    const dir = path.dirname(fromFile);
    const resolved = path.resolve(dir, importPath);

    // Try different extensions
    const extensions = ['.ts', '.tsx', '/index.ts', '/index.tsx'];
    for (const ext of extensions) {
      const fullPath = resolved + ext;
      if (fs.existsSync(fullPath)) {
        return fullPath;
      }
    }

    // Try without extension
    if (fs.existsSync(resolved)) {
      return resolved;
    }
  } else if (importPath.startsWith('@/')) {
    // Handle @/ alias
    const srcDir = path.join(process.cwd(), 'src');
    const relativePath = importPath.replace('@/', '');
    const resolved = path.join(srcDir, relativePath);

    const extensions = ['.ts', '.tsx', '/index.ts', '/index.tsx'];
    for (const ext of extensions) {
      const fullPath = resolved + ext;
      if (fs.existsSync(fullPath)) {
        return fullPath;
      }
    }
  }

  return null;
}

// Run analysis
analyzeDependencies().catch((error) => {
  console.error('Error analyzing dependencies:', error);
  process.exit(1);
});
