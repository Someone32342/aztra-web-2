declare module '*.md' {
  const content: string;
  export default content;
}

declare module '*.txt' {
  const content: string;
  export default content;
}

declare module 'react-twemoji';

declare module '*.scss' {
  const content: Record<string, string>;
  export default content;
}

declare module 'node-emoji-new' {
  import * as type from 'node-emoji';
  export default type;
}
