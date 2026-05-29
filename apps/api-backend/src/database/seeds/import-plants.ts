import 'reflect-metadata';
import * as fs from 'fs';
import * as path from 'path';
import { parse } from 'csv-parse/sync';
import dataSource from '../data-source';
import {
  GrowthForm,
  Product,
  ThreatCategory,
} from '../../products/entities/product.entity';

const DEFAULT_CSV_PATH = path.join(
  process.env.USERPROFILE ?? process.env.HOME ?? '',
  'Downloads',
  'Catalago el patio 25 de febrero 25 en proceso.csv',
);
const CSV_PATH = process.argv[2] ?? DEFAULT_CSV_PATH;

// Limpia sufijos del tipo "(15) G:12" que vienen en la columna Familia
function cleanFamily(value: string): string {
  return value.replace(/\s*\(\d+\)\s*G:\d+/gi, '').trim();
}

// Mapea los valores en español del CSV al enum GrowthForm
function parseGrowthForm(value: string): GrowthForm | undefined {
  const v = value
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();

  if (v === 'arbol' || v === 'arbol estipitado') return GrowthForm.TREE;
  if (v === 'arbustivo' || v === 'arbustiva') return GrowthForm.SHRUB;
  if (v === 'herbaceo' || v === 'herbacea') return GrowthForm.HERB;
  if (v === 'trepadora') return GrowthForm.CLIMBER;
  if (v === 'suculenta' || v === 'suculento') return GrowthForm.SUCCULENT;
  if (v === 'palma' || v === 'palmar') return GrowthForm.PALM;
  return undefined;
}

// Mapea el valor al enum ThreatCategory
function parseThreatCategory(value: string): ThreatCategory | undefined {
  const v = value.trim().toUpperCase();
  if ((Object.values(ThreatCategory) as string[]).includes(v)) {
    return v as ThreatCategory;
  }
  return undefined;
}

// Parsea fechas en formato M/D/YYYY o D/M/YYYY (con posibles espacios)
// Si el primer número > 12, asume D/M. Sino asume M/D.
function parseDate(value: string): Date | undefined {
  const trimmed = value.trim();
  if (!trimmed) return undefined;

  const parts = trimmed.split('/');
  if (parts.length !== 3) return undefined;

  const nums = parts.map((p) => parseInt(p.trim(), 10));
  if (nums.some(isNaN)) return undefined;

  let [a, b, c] = nums;
  // Año de 2 dígitos
  if (c < 100) c += 2000;

  let month: number, day: number;
  if (a > 12) {
    // D/M/YYYY
    day = a;
    month = b;
  } else {
    // M/D/YYYY (formato predominante en el CSV)
    month = a;
    day = b;
  }

  const date = new Date(c, month - 1, day);
  // Valida que la fecha sea real (ej: 30/02 no existe)
  if (
    date.getFullYear() !== c ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return undefined;
  }
  return date;
}

// "x" o "X" → true, cualquier otra cosa → false
function parseBool(value: string): boolean {
  return value.trim().toLowerCase() === 'x';
}

async function main() {
  if (!fs.existsSync(CSV_PATH)) {
    console.error(`No se encontro el archivo CSV: ${CSV_PATH}`);
    console.error(
      'Uso: pnpm run seed:plants [ruta-al-csv]',
    );
    process.exit(1);
  }

  console.log(`Leyendo CSV: ${CSV_PATH}`);
  const content = fs.readFileSync(CSV_PATH);

  const records: Record<string, string>[] = parse(content, {
    columns: true,
    skip_empty_lines: true,
    trim: false, // trimming manual para preservar deteccion de columnas con espacios
    bom: true,
  });

  await dataSource.initialize();
  console.log('Conexion a la BD establecida.\n');

  const repo = dataSource.getRepository(Product);

  let inserted = 0;
  const errors: string[] = [];

  for (const row of records) {
    const commonName = (row['Nombre Vulgar'] ?? '').trim();
    // Filas vacias al final del CSV
    if (!commonName) continue;

    try {
      const plantNumberRaw = (row['No. Planta'] ?? '').trim();
      const populationRaw = (row['Cantidad de individuos'] ?? '').trim();

      const product = repo.create({
        plantNumber: plantNumberRaw ? parseInt(plantNumberRaw, 10) : undefined,
        commonName,
        scientificName: (row['Nombre Científico'] ?? '').trim(),
        genus: (row['Género'] ?? '').trim(),
        family: cleanFamily(row['Familia'] ?? ''),
        growthForm: parseGrowthForm(row['Porte'] ?? ''),
        origin: (row['Origen'] ?? '').trim() || undefined,
        // La columna tiene un espacio al final en el CSV: "Procedencia "
        provenance:
          (row['Procedencia '] ?? row['Procedencia'] ?? '').trim() || undefined,
        collector: (row['Colector'] ?? '').trim() || undefined,
        threatCategory: parseThreatCategory(row['Categoria de amenaza'] ?? ''),
        isEndemic: (row['Endemismo'] ?? '').trim()
          ? parseBool(row['Endemismo'])
          : undefined,
        population: populationRaw ? parseInt(populationRaw, 10) : undefined,
        registrationDate: parseDate(row['Fecha de alta'] ?? ''),
        deathDate: parseDate(row['Fecha de Muerte'] ?? ''),
        mainPopularUse: {
          popularUse: parseBool(row['Mayor uso popular'] ?? ''),
          medicinal: parseBool(row['Medicinal'] ?? ''),
          aromatic: parseBool(row['Aromática'] ?? ''),
          culinary: parseBool(row['Alimento'] ?? ''),
        },
      });

      await repo.save(product);
      inserted++;
      process.stdout.write(`[${inserted}] ${commonName}\n`);
    } catch (err) {
      const msg = `  ERROR en "${commonName}": ${err instanceof Error ? err.message : String(err)}`;
      errors.push(msg);
      console.error(msg);
    }
  }

  await dataSource.destroy();

  console.log('\n----------------------------------------');
  console.log(`Plantas insertadas : ${inserted}`);
  console.log(`Errores            : ${errors.length}`);
  if (errors.length > 0) {
    console.log('\nDetalle de errores:');
    errors.forEach((e) => console.log(e));
  }
  console.log('----------------------------------------');
}

main().catch((err) => {
  console.error('Error fatal:', err);
  process.exit(1);
});
