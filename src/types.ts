import { Mod } from 'ultimate-crosscode-typedefs/modloader/mod'
import type {} from 'crossnode/crossnode'
import type {} from 'cc-instanceinator/src/plugin'
import type {} from 'cc-determine/src/plugin'
// @ts-ignore prevent type errors in cc-multibakery
import type {} from 'cc-multibakery/src/types'

export type Mod1 = Mod & {
    isCCModPacked: boolean
    findAllAssets?(): void /* only there for ccl2, used to set isCCL3 */
} & (
        | {
              isCCL3: true
              id: string
              findAllAssets(): void
          }
        | {
              isCCL3: false
              name: string
              filemanager: {
                  findFiles(dir: string, exts: string[]): Promise<string[]>
              }
              getAsset(path: string): string
              runtimeAssets: Record<string, string>
          }
    )
