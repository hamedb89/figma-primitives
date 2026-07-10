export type FigmaLayerCapability = 'selectable' | 'readableText' | 'writableText' | 'acceptsChildren' | 'supportsFills' | 'supportsPluginData'
export type FigmaLayer = {
  bounds?: { height: number; width: number; x: number; y: number }
  capabilities: Record<FigmaLayerCapability, boolean>
  children?: FigmaLayer[]
  id: string
  locked: boolean
  name: string
  pageId: string
  parentId?: string
  text?: { characters: string }
  type: string
  visible: boolean
}

export type InspectableNode = {
  absoluteBoundingBox?: { height: number; width: number; x: number; y: number } | null
  characters?: string
  children?: readonly InspectableNode[]
  id: string
  locked?: boolean
  name: string
  parent?: { id: string; type?: string } | null
  type: string
  visible?: boolean
}

export function inspectLayer(node: InspectableNode, pageId: string, depth = 0): FigmaLayer {
  const readableText = typeof node.characters === 'string'
  return {
    bounds: node.absoluteBoundingBox ?? undefined,
    capabilities: {
      acceptsChildren: Array.isArray(node.children),
      readableText,
      selectable: true,
      supportsFills: node.type !== 'GROUP',
      supportsPluginData: true,
      writableText: readableText,
    },
    children: depth > 0 ? node.children?.map((child) => inspectLayer(child, pageId, depth - 1)) : undefined,
    id: node.id,
    locked: node.locked ?? false,
    name: node.name,
    pageId,
    parentId: node.parent?.id,
    text: readableText ? { characters: node.characters! } : undefined,
    type: node.type,
    visible: node.visible ?? true,
  }
}
