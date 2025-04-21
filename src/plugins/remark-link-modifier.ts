import { visit } from 'unist-util-visit';
import { Link } from 'mdast';
import { Plugin } from 'unified';

interface LinkModifierOptions {
  upgradeToHttps?: boolean;
  addParams?: Array<{key: string, value: string}>;
  normalizeInternal?: boolean;
  removeTrailingSlash?: boolean;
  addBaseUrl?: boolean;
  baseUrl?: string;
}

// Helper function to apply transformations to links
function applyTransformations(node: Link, options: LinkModifierOptions): void {
  const url = node.url;

  // Convert HTTP to HTTPS
  if (options.upgradeToHttps && url.startsWith('http://')) {
    node.url = url.replace('http://', 'https://');
  }

  // Add referral or tracking parameters
  if (options.addParams && options.addParams.length > 0) {
    const separator = url.includes('?') ? '&' : '?';
    const params = options.addParams
      .map(param => `${param.key}=${param.value}`)
      .join('&');

    node.url = `${url}${separator}${params}`;
  }

  // Normalize internal links
  if (options.normalizeInternal &&
      url.startsWith('/') &&
      !url.startsWith('//')) {
    // Remove trailing slashes
    if (options.removeTrailingSlash && url.endsWith('/') && url.length > 1) {
      node.url = url.slice(0, -1);
    }

    // Add base URL for internal links
    if (options.addBaseUrl && options.baseUrl) {
      node.url = `${options.baseUrl}${node.url}`;
    }
  }
}

const remarkLinkModifier: Plugin<[LinkModifierOptions?]> = function(options: LinkModifierOptions = {}) {
  // Return a transformer function that can handle async operations
  return tree =>{
    // This array will hold our promises if we're doing async link checking
    const promises: Promise<void>[] = [];

    visit(tree, 'definition', (node: Link) => {
      applyTransformations(node, options);
    });

    // If we have async operations, return a promise
    if (promises.length > 0) {
      return Promise.all(promises).then(() => tree);
    }

    // Otherwise return the tree directly for synchronous operation
    return tree;
  };
};

export default remarkLinkModifier;
