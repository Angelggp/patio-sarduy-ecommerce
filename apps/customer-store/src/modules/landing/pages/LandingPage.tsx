import { useRef } from 'react'
import { Link } from 'react-router-dom'
import { motion, useScroll, useTransform } from 'framer-motion'
import { Clock, MapPin, Sprout, Leaf, Utensils, FlaskConical, Flower2, ChevronDown } from 'lucide-react'
import heroBg from '@/img/hero-bg.jpg'

const INFO_ITEMS = [
  {
    icon: Clock,
    title: 'Horario',
    lines: ['Lun – Sáb: 8:00 AM – 4:00 PM', 'Domingo: cerrado'],
  },
  {
    icon: MapPin,
    title: 'Dirección',
    lines: ['Calle 53 #6801 / 68 y 70 San Lázaro. Cienfuegos, Cuba. ', 'Organopónico comunitario'],
  },
  {
    icon: Sprout,
    title: 'Catálogo',
    lines: ['Más de 200 especies', 'Actualizado semanalmente'],
  },
]

const CATEGORIES = [
  {
    icon: Leaf,
    label: 'Ornamentales',
    description: 'Embellece tu hogar y jardín con plantas de follaje y color.',
    bg: 'var(--bg-soft-mint)',
  },
  {
    icon: Utensils,
    label: 'Culinarias',
    description: 'Hierbas y condimentos frescos para tu cocina diaria.',
    bg: '#fef9c3',
  },
  {
    icon: FlaskConical,
    label: 'Medicinales',
    description: 'Plantas con propiedades terapéuticas de uso tradicional.',
    bg: '#fce7f3',
  },
  {
    icon: Flower2,
    label: 'Aromáticas',
    description: 'Fragancias naturales que transforman cualquier espacio.',
    bg: '#ede9fe',
  },
]

export function LandingPage() {
  const heroRef = useRef<HTMLDivElement>(null)

  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start'],
  })

  // Parallax: image shifts down slightly as user scrolls → appears slower than page
  const imgY = useTransform(scrollYProgress, [0, 1], ['-5%', '5%'])
  // Hero text fades and lifts as user scrolls away
  const contentOpacity = useTransform(scrollYProgress, [0, 0.55], [1, 0])
  const contentY = useTransform(scrollYProgress, [0, 0.55], ['0%', '-6%'])

  return (
    <div>
      {/* ── Hero ──────────────────────────────────────────────────── */}
      <div
        ref={heroRef}
        className='relative h-svh overflow-hidden'
        style={{ backgroundColor: 'var(--bg-deep-forest)' }}
      >
        {/* Parallax image */}
        <motion.div
          style={{ y: imgY }}
          className='absolute inset-0 scale-[1.15]'
          aria-hidden='true'
        >
          <img
            src={heroBg}
            alt=''
            className='h-full w-full object-cover'
          />
        </motion.div>

        {/* Gradient overlay */}
        <div
          className='absolute inset-0'
          style={{
            background:
              'linear-gradient(180deg, rgba(8,39,21,0.15) 0%, rgba(8,39,21,0.30) 40%, rgba(8,39,21,0.75) 100%)',
          }}
        />

        {/* Hero content */}
        <motion.div
          style={{ opacity: contentOpacity, y: contentY }}
          className='absolute inset-0 flex flex-col items-center justify-center px-4 text-center'
        >
          <motion.span
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.25 }}
            className='mb-7 rounded-full border border-white/25 bg-white/10 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-widest text-white/75 backdrop-blur-sm'
          >
            Organopónico comunitario · Cienfuegos
          </motion.span>

          <motion.h1
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, delay: 0.4 }}
            className='mb-6 leading-tigh '
            style={{ fontSize: 'clamp(2.8rem, 8vw, 5rem)', color: 'white' }}
          >
            "El Patio"
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.6 }}
            className='mb-10 max-w-sm text-base text-white/70 sm:max-w-md sm:text-lg'
          >
            Plantas medicinales, culinarias y ornamentales cultivadas con cuidado. Directamente del
            vivero a tu hogar.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.45, delay: 0.8 }}
            whileHover={{ scale: 1.06 }}
            whileTap={{ scale: 0.95 }}
            className='mt-4'
          >
            <Link
              to='/plantas'
              className='group inline-flex items-center gap-2.5 rounded-full px-8 py-4 text-sm font-bold shadow-xl transition-[box-shadow] duration-300 hover:shadow-[0_0_40px_rgba(100,180,60,0.5)]'
              style={{
                backgroundColor: 'var(--brand-primary)',
                color: 'var(--bg-deep-forest)',
              }}
            >
                <Leaf className='size-5 transition-transform duration-300 group-hover:translate-x-' />
              Ver catálogo
              
             
            </Link>
          </motion.div>
        </motion.div>

        {/* Scroll hint */}
        <motion.div
          className='absolute bottom-7 left-1/2 -translate-x-1/2 text-white/40'
          animate={{ y: [0, 7, 0] }}
          transition={{ repeat: Infinity, duration: 1.8, ease: 'easeInOut' }}
        >
          <ChevronDown className='size-6' />
        </motion.div>
      </div>

      {/* ── Info cards ────────────────────────────────────────────── */}
      <section className='mx-auto max-w-6xl px-4 py-14 lg:px-8'>
        <div className='grid gap-4 sm:grid-cols-3'>
          {INFO_ITEMS.map((item, i) => {
            const Icon = item.icon
            return (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 28 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ duration: 0.45, delay: i * 0.1 }}
                className='rounded-[var(--radius-lg)] border border-border bg-card p-5 shadow-[var(--shadow-soft)]'
              >
                <div
                  className='mb-3 inline-flex rounded-[var(--radius-sm)] p-2.5'
                  style={{ backgroundColor: 'var(--bg-soft-mint)' }}
                >
                  <Icon className='size-5' style={{ color: 'var(--bg-deep-forest)' }} />
                </div>
                <h3 className='mb-1.5 text-sm font-semibold text-foreground'>{item.title}</h3>
                {item.lines.map((line) => (
                  <p key={line} className='text-sm text-muted-foreground'>
                    {line}
                  </p>
                ))}
              </motion.div>
            )
          })}
        </div>
      </section>

      {/* ── Categorías ────────────────────────────────────────────── */}
      <section className='mx-auto max-w-6xl px-4 pb-14 lg:px-8'>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.45 }}
          className='mb-8'
        >
          <h2 className='mb-1 text-2xl sm:text-3xl'>Lo que encontrarás</h2>
          <p className='text-muted-foreground'>Cuatro grandes grupos de plantas disponibles</p>
        </motion.div>

        <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-4'>
          {CATEGORIES.map((cat, i) => {
            const Icon = cat.icon
            return (
              <motion.div
                key={cat.label}
                initial={{ opacity: 0, y: 28 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ duration: 0.45, delay: i * 0.08 }}
                className='rounded-[var(--radius-lg)] border border-border bg-card p-5 shadow-[var(--shadow-soft)]'
              >
                <div
                  className='mb-3 inline-flex rounded-[var(--radius-sm)] p-2.5'
                  style={{ backgroundColor: cat.bg }}
                >
                  <Icon className='size-5' style={{ color: 'var(--bg-deep-forest)' }} />
                </div>
                <h3 className='mb-1 text-sm font-semibold'>{cat.label}</h3>
                <p className='text-sm text-muted-foreground'>{cat.description}</p>
              </motion.div>
            )
          })}
        </div>
      </section>

      {/* ── CTA ───────────────────────────────────────────────────── */}
      <section className='mx-auto max-w-6xl px-4 pb-10 lg:px-8'>
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.5 }}
          className='overflow-hidden rounded-[var(--radius-xl)] px-8 py-14 text-center shadow-[var(--shadow-float)]'
          style={{ backgroundColor: 'var(--bg-deep-forest)' }}
        >
          <h2
            className='mb-3 text-2xl sm:text-3xl'
            style={{ color: 'var(--text-on-dark)' }}
          >
            ¿Listo para llevar verde a tu espacio?
          </h2>
          <p className='mb-7 text-sm sm:text-base' style={{ color: 'rgba(245,248,245,0.65)' }}>
            Explora el catálogo completo y arma tu pedido en minutos.
          </p>
          <Link
            to='/plantas'
            className='inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-bold transition-opacity hover:opacity-90 mt-4'
            style={{
              backgroundColor: 'var(--brand-primary)',
              color: 'var(--bg-deep-forest)',
            }}
          >
            <Leaf className='size-4' />
            Explorar plantas
          </Link>
        </motion.div>
      </section>

      {/* ── Cómo funciona ─────────────────────────────────────────── */}
      <section className='mx-auto max-w-6xl px-4 pb-16 lg:px-8'>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.45 }}
          className='mb-8'
        >
          <h2 className='mb-1 text-2xl sm:text-3xl'>¿Cómo funciona?</h2>
          <p className='text-muted-foreground'>Todo lo que necesitas saber antes de pedir</p>
        </motion.div>

        <div className='grid gap-4 sm:grid-cols-2'>
          {/* Pedidos */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.45, delay: 0.05 }}
            className='rounded-[var(--radius-lg)] border border-border bg-card p-6 shadow-[var(--shadow-soft)]'
          >
            <p className='mb-3 inline-flex rounded-[var(--radius-sm)] bg-[var(--bg-soft-mint)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.1em] text-[var(--bg-deep-forest)]'>
              Pedidos
            </p>
            <h3 className='mb-2 text-base font-semibold'>Elige, confirma y recoge</h3>
            <ol className='space-y-1.5 text-sm text-muted-foreground'>
              <li><span className='font-medium text-foreground'>1.</span> Busca las plantas en el catálogo y agrégalas al carrito.</li>
              <li><span className='font-medium text-foreground'>2.</span> Ve al carrito, revisa el resumen y completa tu nombre y teléfono.</li>
              <li><span className='font-medium text-foreground'>3.</span> Confirma el pedido — lo prepararemos para que lo recojas en el vivero.</li>
            </ol>
          </motion.div>

          {/* Cuenta */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.45, delay: 0.12 }}
            className='rounded-[var(--radius-lg)] border border-border bg-card p-6 shadow-[var(--shadow-soft)]'
          >
            <p className='mb-3 inline-flex rounded-[var(--radius-sm)] bg-[var(--bg-soft-mint)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.1em] text-[var(--bg-deep-forest)]'>
              Tu cuenta
            </p>
            <h3 className='mb-2 text-base font-semibold'>Opcional, pero útil</h3>
            <p className='text-sm text-muted-foreground'>
              Puedes pedir sin registrarte. Si creas una cuenta, tu historial de pedidos queda
              guardado y accesible en cualquier momento. Los pedidos que hayas hecho como invitado
              se enlazan automáticamente cuando los datos coinciden.
            </p>
          </motion.div>
        </div>
      </section>

      {/* ── Footer ────────────────────────────────────────────────── */}
      <footer style={{ backgroundColor: 'var(--bg-deep-forest)' }}>
        <div className='mx-auto max-w-6xl px-4 py-12 lg:px-8'>
          <div className='flex flex-col gap-8 sm:flex-row sm:justify-between'>
            {/* Marca */}
            <div className='space-y-1.5'>
              <p className='font-heading text-xl' style={{ color: 'var(--text-on-dark)' }}>
                El Patio
              </p>
              <p className='text-sm' style={{ color: 'rgba(245,248,245,0.5)' }}>
                Organopónico comunitario · Cienfuegos, Cuba
              </p>
            </div>

            {/* Contacto */}
            <div className='space-y-3'>
              <p
                className='text-xs font-semibold uppercase tracking-[0.12em]'
                style={{ color: 'rgba(245,248,245,0.4)' }}
              >
                Contacto
              </p>
              <ul className='space-y-2 text-sm'>
                <li>
                  <a
                    href='https://wa.me/5355189097'
                    target='_blank'
                    rel='noopener noreferrer'
                    className='transition-colors'
                    style={{ color: 'rgba(245,248,245,0.65)' }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--text-on-dark)')}
                    onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(245,248,245,0.65)')}
                  >
                    WhatsApp · +53 5 5189097
                  </a>
                </li>
                <li>
                  <a
                    href='mailto:patiosarduy@gmail.com'
                    className='transition-colors'
                    style={{ color: 'rgba(245,248,245,0.65)' }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--text-on-dark)')}
                    onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(245,248,245,0.65)')}
                  >
                    patiosarduy@gmail.com
                  </a>
                </li>
                <li>
                  <a
                    href='https://www.instagram.com/patiosarduy'
                    target='_blank'
                    rel='noopener noreferrer'
                    className='transition-colors'
                    style={{ color: 'rgba(245,248,245,0.65)' }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--text-on-dark)')}
                    onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(245,248,245,0.65)')}
                  >
                    Instagram · @patiosarduy
                  </a>
                </li>
                <li>
                  <a
                    href='https://www.facebook.com/patiosarduy'
                    target='_blank'
                    rel='noopener noreferrer'
                    className='transition-colors'
                    style={{ color: 'rgba(245,248,245,0.65)' }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--text-on-dark)')}
                    onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(245,248,245,0.65)')}
                  >
                    Facebook · El Patio
                  </a>
                </li>
              </ul>
            </div>
          </div>

          {/* Línea separadora + copyright */}
          <div
            className='mt-10 border-t pt-6 text-xs'
            style={{
              borderColor: 'rgba(245,248,245,0.1)',
              color: 'rgba(245,248,245,0.3)',
            }}
          >
            © {new Date().getFullYear()} El Patio. Todos los derechos reservados.
          </div>
        </div>
      </footer>
    </div>
  )
}
