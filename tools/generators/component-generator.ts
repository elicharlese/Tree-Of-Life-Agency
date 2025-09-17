#!/usr/bin/env node

// Component Generator Tool
// Following Windsurf Global Rules for TypeScript and React components

import fs from 'fs';
import path from 'path';

interface ComponentOptions {
  name: string;
  type: 'page' | 'component' | 'layout';
  directory?: string;
  withTests?: boolean;
  withStories?: boolean;
}

class ComponentGenerator {
  private templatesDir: string;
  private outputDir: string;

  constructor() {
    this.templatesDir = path.join(__dirname, 'templates');
    this.outputDir = process.cwd();
  }

  // Generate React component with TypeScript
  generateComponent(options: ComponentOptions): void {
    const { name, type, directory = 'app/components', withTests = true, withStories = false } = options;
    
    // Validate component name
    if (!this.isValidComponentName(name)) {
      throw new Error('Invalid component name. Use PascalCase (e.g., MyComponent)');
    }

    const componentDir = path.join(this.outputDir, directory, name);
    
    // Create component directory
    this.ensureDirectoryExists(componentDir);

    // Generate main component file
    this.generateComponentFile(componentDir, name, type);

    // Generate index file for barrel export
    this.generateIndexFile(componentDir, name);

    // Generate test file if requested
    if (withTests) {
      this.generateTestFile(componentDir, name);
    }

    // Generate Storybook story if requested
    if (withStories) {
      this.generateStoryFile(componentDir, name);
    }

    console.log(`✅ Generated ${type} component: ${name}`);
    console.log(`📁 Location: ${componentDir}`);
  }

  private generateComponentFile(dir: string, name: string, type: string): void {
    const template = this.getComponentTemplate(name, type);
    const filePath = path.join(dir, `${name}.tsx`);
    fs.writeFileSync(filePath, template);
  }

  private generateIndexFile(dir: string, name: string): void {
    const template = `export { ${name} } from './${name}';\nexport type { ${name}Props } from './${name}';\n`;
    const filePath = path.join(dir, 'index.ts');
    fs.writeFileSync(filePath, template);
  }

  private generateTestFile(dir: string, name: string): void {
    const template = this.getTestTemplate(name);
    const filePath = path.join(dir, `${name}.test.tsx`);
    fs.writeFileSync(filePath, template);
  }

  private generateStoryFile(dir: string, name: string): void {
    const template = this.getStoryTemplate(name);
    const filePath = path.join(dir, `${name}.stories.tsx`);
    fs.writeFileSync(filePath, template);
  }

  private getComponentTemplate(name: string, type: string): string {
    if (type === 'page') {
      return this.getPageTemplate(name);
    }
    
    return `'use client';

import React from 'react';

interface ${name}Props {
  children?: React.ReactNode;
  className?: string;
}

const ${name}: React.FC<${name}Props> = ({ 
  children, 
  className = '' 
}) => {
  return (
    <div className={\`${name.toLowerCase()} \${className}\`}>
      {children || (
        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            ${name} Component
          </h2>
          <p className="text-gray-600 mt-2">
            This is a generated component. Customize it according to your needs.
          </p>
        </div>
      )}
    </div>
  );
};

export { ${name} };
export type { ${name}Props };
`;
  }

  private getPageTemplate(name: string): string {
    return `'use client';

import React from 'react';
import { useAuth } from '@/contexts/AuthContext';

interface ${name}Props {
  params?: { [key: string]: string };
  searchParams?: { [key: string]: string | string[] | undefined };
}

export default function ${name}Page({ params, searchParams }: ${name}Props) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">${name}</h1>
          <p className="mt-2 text-gray-600">
            This is a generated page component. Customize it according to your needs.
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Content Area</h2>
          <p className="text-gray-600">
            Add your page content here. You have access to user data: {user?.firstName} {user?.lastName}
          </p>
        </div>
      </div>
    </div>
  );
}

export type { ${name}Props };
`;
  }

  private getTestTemplate(name: string): string {
    return `import React from 'react';
import { render, screen } from '@testing-library/react';
import { ${name} } from './${name}';

describe('${name}', () => {
  it('renders without crashing', () => {
    render(<${name} />);
    expect(screen.getByText('${name} Component')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    const customClass = 'custom-class';
    render(<${name} className={customClass} />);
    const element = screen.getByText('${name} Component').parentElement;
    expect(element).toHaveClass(customClass);
  });

  it('renders children when provided', () => {
    const childText = 'Custom child content';
    render(<${name}>{childText}</${name}>);
    expect(screen.getByText(childText)).toBeInTheDocument();
  });
});
`;
  }

  private getStoryTemplate(name: string): string {
    return `import type { Meta, StoryObj } from '@storybook/react';
import { ${name} } from './${name}';

const meta: Meta<typeof ${name}> = {
  title: 'Components/${name}',
  component: ${name},
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    className: {
      control: 'text',
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};

export const WithCustomContent: Story = {
  args: {
    children: (
      <div>
        <h3 className="text-lg font-medium">Custom Content</h3>
        <p>This is custom content passed as children.</p>
      </div>
    ),
  },
};

export const WithCustomClass: Story = {
  args: {
    className: 'bg-blue-50 p-4 rounded-lg border-2 border-blue-200',
  },
};
`;
  }

  private isValidComponentName(name: string): boolean {
    // Check if name is PascalCase
    const pascalCaseRegex = /^[A-Z][a-zA-Z0-9]*$/;
    return pascalCaseRegex.test(name);
  }

  private ensureDirectoryExists(dir: string): void {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }
}

// CLI Interface
function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log(`
🚀 Component Generator

Usage:
  npm run generate:component <ComponentName> [options]

Options:
  --type <page|component|layout>  Component type (default: component)
  --dir <directory>               Output directory (default: app/components)
  --no-tests                      Skip test file generation
  --stories                       Generate Storybook stories

Examples:
  npm run generate:component UserProfile
  npm run generate:component LoginPage --type page --dir app/auth
  npm run generate:component Header --type component --stories
    `);
    return;
  }

  const name = args[0];
  const options: ComponentOptions = {
    name,
    type: 'component',
    withTests: true,
    withStories: false,
  };

  // Parse CLI arguments
  for (let i = 1; i < args.length; i++) {
    const arg = args[i];
    
    switch (arg) {
      case '--type':
        options.type = args[++i] as 'page' | 'component' | 'layout';
        break;
      case '--dir':
        options.directory = args[++i];
        break;
      case '--no-tests':
        options.withTests = false;
        break;
      case '--stories':
        options.withStories = true;
        break;
    }
  }

  try {
    const generator = new ComponentGenerator();
    generator.generateComponent(options);
  } catch (error) {
    console.error('❌ Error generating component:', error);
    process.exit(1);
  }
}

// Run CLI if this file is executed directly
if (require.main === module) {
  main();
}

export { ComponentGenerator };
export type { ComponentOptions };
