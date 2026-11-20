import {
  BASE_SHAPES,
  BlockShape,
  TARGET_PATTERNS,
  TargetPattern,
} from '../types/game';

export const GRID_SIZE = 8;

/**
 * Deterministic PRNG for Daily Challenge mode so all players globally get
 * the exact same block sequence and pattern sequence on a given UTC day.
 */
export function createSeededRandom(seedStr: string): () => number {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < seedStr.length; i++) {
    h ^= seedStr.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return function () {
    h += h << 13;
    h ^= h >>> 7;
    h += h << 3;
    h ^= h >>> 17;
    h += h << 5;
    return (h >>> 0) / 4294967296;
  };
}

export function getTodayDateKey(): string {
  const now = new Date();
  const yyyy = now.getUTCFullYear();
  const mm = String(now.getUTCMonth() + 1).padStart(2, '0');
  const dd = String(now.getUTCDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

export function getCurrentMonthKey(): string {
  const now = new Date();
  const yyyy = now.getUTCFullYear();
  const mm = String(now.getUTCMonth() + 1).padStart(2, '0');
  return `${yyyy}-${mm}`;
}

export function generateBlockBatch(rng: () => number, batchCounter: number): BlockShape[] {
  const batch: BlockShape[] = [];
  for (let i = 0; i < 3; i++) {
    const templateIndex = Math.floor(rng() * BASE_SHAPES.length);
    const template = BASE_SHAPES[templateIndex];
    const colorIndex = (Math.floor(rng() * 4) % 4) + 1;
    batch.push({
      id: `blk_${batchCounter}_${i}_${Math.floor(rng() * 10000)}`,
      name: template.name,
      cells: template.cells.map((row) => [...row]),
      colorIndex,
    });
  }
  return batch;
}

export function rotateShapeMatrix(cells: number[][]): number[][] {
  const rows = cells.length;
  const cols = cells[0].length;
  const rotated: number[][] = Array.from({ length: cols }, () =>
    Array(rows).fill(0)
  );
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      rotated[c][rows - 1 - r] = cells[r][c];
    }
  }
  return rotated;
}

export function canPlaceShape(
  grid: number[][],
  shape: BlockShape,
  startRow: number,
  startCol: number
): boolean {
  const rows = shape.cells.length;
  const cols = shape.cells[0].length;

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (shape.cells[r][c] === 1) {
        const targetR = startRow + r;
        const targetC = startCol + c;
        if (
          targetR < 0 ||
          targetR >= GRID_SIZE ||
          targetC < 0 ||
          targetC >= GRID_SIZE
        ) {
          return false;
        }
        if (grid[targetR][targetC] !== 0) {
          return false;
        }
      }
    }
  }
  return true;
}

export function canAnyShapeFit(
  grid: number[][],
  shapes: (BlockShape | null)[]
): boolean {
  const activeShapes = shapes.filter((s): s is BlockShape => s !== null);
  if (activeShapes.length === 0) return true;

  for (const shape of activeShapes) {
    // Check all 4 rotations so the player isn't prematurely locked out if a rotation fits
    let testCells = shape.cells;
    for (let rot = 0; rot < 4; rot++) {
      const testShape: BlockShape = { ...shape, cells: testCells };
      for (let r = 0; r < GRID_SIZE; r++) {
        for (let c = 0; c < GRID_SIZE; c++) {
          if (canPlaceShape(grid, testShape, r, c)) {
            return true;
          }
        }
      }
      testCells = rotateShapeMatrix(testCells);
    }
  }
  return false;
}

/**
 * Checks if the 3x3 Target Pattern exists anywhere on the 8x8 grid.
 * Returns the top-left [row, col] coordinate of the matched 3x3 zone if found.
 */
export function findCompletedPatternZone(
  grid: number[][],
  pattern: TargetPattern
): { row: number; col: number } | null {
  for (let r = 0; r <= GRID_SIZE - 3; r++) {
    for (let c = 0; c <= GRID_SIZE - 3; c++) {
      let matches = true;
      for (let pr = 0; pr < 3; pr++) {
        for (let pc = 0; pc < 3; pc++) {
          if (pattern.matrix[pr][pc] === 1 && grid[r + pr][c + pc] === 0) {
            matches = false;
            break;
          }
        }
        if (!matches) break;
      }
      if (matches) {
        return { row: r, col: c };
      }
    }
  }
  return null;
}

export function selectNextPattern(
  rng: () => number,
  currentId?: string
): TargetPattern {
  const candidates = TARGET_PATTERNS.filter((p) => p.id !== currentId);
  const idx = Math.floor(rng() * candidates.length);
  return candidates[idx] || TARGET_PATTERNS[0];
}

export interface MonumentProgress {
  filledRequired: number;
  totalRequired: number;
  misplacedCells: number;
  percentage: number;
  isComplete: boolean;
}

export function getMonumentProgress(
  grid: number[][],
  blueprint: number[][]
): MonumentProgress {
  let totalRequired = 0;
  let filledRequired = 0;
  let misplacedCells = 0;

  for (let r = 0; r < GRID_SIZE; r++) {
    for (let c = 0; c < GRID_SIZE; c++) {
      const req = blueprint[r]?.[c] || 0;
      const actual = grid[r]?.[c] || 0;
      if (req > 0) {
        totalRequired++;
        if (actual > 0) {
          filledRequired++;
        }
      } else if (actual > 0) {
        misplacedCells++;
      }
    }
  }

  const percentage =
    totalRequired > 0 ? Math.round((filledRequired / totalRequired) * 100) : 0;
  const isComplete = totalRequired > 0 && filledRequired === totalRequired;

  return {
    filledRequired,
    totalRequired,
    misplacedCells,
    percentage,
    isComplete,
  };
}

/**
 * Generates a 3-piece tray tailored to the remaining unfilled cells of a concrete
 * 8x8 Target Monument Blueprint (e.g., NYC Skyline or Eiffel Tower) so every piece
 * fits cleanly inside the monument's architectural silhouette.
 */
export function generatePuzzleModeBatch(
  grid: number[][],
  blueprint: number[][],
  rng: () => number,
  batchCounter: number,
  letterGrid?: string[][]
): BlockShape[] {
  const simGrid = grid.map((r) => [...r]);
  const batch: BlockShape[] = [];

  // Candidate shapes ordered from medium multi-block segments down to 1x1 precision blocks
  const multiCellCandidates = BASE_SHAPES.filter((s) => {
    const count = s.cells.reduce(
      (acc, row) => acc + row.reduce((a, v) => a + v, 0),
      0
    );
    return count >= 2 && count <= 4;
  });
  const singleDotTemplate = BASE_SHAPES[0]; // Single Dot [[1]]

  for (let i = 0; i < 3; i++) {
    // Find all valid fits where EVERY cell of a candidate shape lands on an unfilled blueprint cell
    const validFits: {
      template: Omit<BlockShape, 'id' | 'colorIndex'>;
      r: number;
      c: number;
      colorIndex: number;
    }[] = [];

    for (const template of multiCellCandidates) {
      const sRows = template.cells.length;
      const sCols = template.cells[0].length;
      for (let r = 0; r <= GRID_SIZE - sRows; r++) {
        for (let c = 0; c <= GRID_SIZE - sCols; c++) {
          let allMatchUnfilledBlueprint = true;
          let detectedColor = 1;
          for (let sr = 0; sr < sRows; sr++) {
            for (let sc = 0; sc < sCols; sc++) {
              if (template.cells[sr][sc] === 1) {
                const tr = r + sr;
                const tc = c + sc;
                if (simGrid[tr][tc] !== 0 || blueprint[tr][tc] === 0) {
                  allMatchUnfilledBlueprint = false;
                  break;
                }
                detectedColor = blueprint[tr][tc];
              }
            }
            if (!allMatchUnfilledBlueprint) break;
          }
          if (allMatchUnfilledBlueprint) {
            validFits.push({
              template,
              r,
              c,
              colorIndex: detectedColor,
            });
          }
        }
      }
    }

    if (validFits.length > 0) {
      const chosen = validFits[Math.floor(rng() * validFits.length)];
      let extractedLetters = '';
      const cellLetters: string[][] | undefined = letterGrid
        ? chosen.template.cells.map((row, sr) =>
            row.map((val, sc) => {
              if (val === 1) {
                const ch = letterGrid[chosen.r + sr]?.[chosen.c + sc] || '';
                extractedLetters += ch;
                return ch;
              }
              return '';
            })
          )
        : undefined;

      // Mark cells in simGrid so the next piece in the 3-block tray targets other unfilled parts of the puzzle
      for (let sr = 0; sr < chosen.template.cells.length; sr++) {
        for (let sc = 0; sc < chosen.template.cells[0].length; sc++) {
          if (chosen.template.cells[sr][sc] === 1) {
            simGrid[chosen.r + sr][chosen.c + sc] = chosen.colorIndex;
          }
        }
      }
      batch.push({
        id: `puz_${batchCounter}_${i}_${Math.floor(rng() * 10000)}`,
        name:
          extractedLetters.length > 0
            ? `"${extractedLetters}"`
            : chosen.template.name,
        cells: chosen.template.cells.map((row) => [...row]),
        colorIndex: chosen.colorIndex,
        cellLetters,
      });
      continue;
    }

    // Fallback: look for any single unfilled blueprint cell for a 1x1 precision block
    const singleCells: { r: number; c: number; colorIndex: number }[] = [];
    for (let r = 0; r < GRID_SIZE; r++) {
      for (let c = 0; c < GRID_SIZE; c++) {
        if (blueprint[r][c] > 0 && simGrid[r][c] === 0) {
          singleCells.push({ r, c, colorIndex: blueprint[r][c] });
        }
      }
    }

    if (singleCells.length > 0) {
      const chosenCell = singleCells[Math.floor(rng() * singleCells.length)];
      simGrid[chosenCell.r][chosenCell.c] = chosenCell.colorIndex;
      const singleLetter =
        letterGrid?.[chosenCell.r]?.[chosenCell.c] || '';
      batch.push({
        id: `puz_${batchCounter}_${i}_${Math.floor(rng() * 10000)}`,
        name:
          singleLetter.length > 0
            ? `Letter "${singleLetter}"`
            : singleDotTemplate.name,
        cells: [[1]],
        colorIndex: chosenCell.colorIndex,
        cellLetters: letterGrid ? [[singleLetter]] : undefined,
      });
    } else {
      // Puzzle is virtually complete; deal a 1x1 block so tray has 3 items
      batch.push({
        id: `puz_${batchCounter}_${i}_${Math.floor(rng() * 10000)}`,
        name: singleDotTemplate.name,
        cells: [[1]],
        colorIndex: (i % 4) + 1,
      });
    }
  }

  return batch;
}


