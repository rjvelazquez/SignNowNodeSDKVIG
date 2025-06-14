/*
 * This file is a part of signNow SDK API client.
 *
 * (с) Copyright © 2011-present airSlate Inc. (https://www.signnow.com)
 *
 * For more details on copyright, see LICENSE.md file
 * that was distributed with this source code.
 */

export interface TemplateGet {
  id: string;
  template_name?: string;
  document_name?: string;
  roles?: string[];
  owner_email?: string;
  owner?: string;
  thumbnail?: {
    small: string;
    medium: string;
    large: string;
  };
} 