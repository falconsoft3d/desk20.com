import Link from 'next/link'
import { Headphones, MessageSquare, BarChart3, Users, Shield, Zap } from 'lucide-react'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <nav className="border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <Headphones className="h-8 w-8 text-primary-600" />
              <span className="text-2xl font-bold text-gray-900">Desk20</span>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/login" className="text-gray-700 hover:text-gray-900">
                Iniciar Sesión
              </Link>
              <Link 
                href="/register" 
                className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition"
              >
                Comenzar Gratis
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-20 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-5xl font-bold text-gray-900 mb-6">
              Soporte Técnico <span className="text-primary-600">Simplificado</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Gestiona tickets, conversaciones y clientes en una sola plataforma. 
              Inspirado en Zendesk, diseñado para equipos modernos.
            </p>
            <div className="flex justify-center space-x-4">
              <Link 
                href="/dashboard" 
                className="bg-primary-600 text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-primary-700 transition"
              >
                Ver Dashboard
              </Link>
              <Link 
                href="#features" 
                className="bg-gray-100 text-gray-900 px-8 py-3 rounded-lg text-lg font-semibold hover:bg-gray-200 transition"
              >
                Conocer Más
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Todo lo que necesitas
            </h2>
            <p className="text-xl text-gray-600">
              Funcionalidades diseñadas para optimizar tu soporte
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-xl shadow-sm hover:shadow-md transition">
              <div className="bg-primary-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <MessageSquare className="h-6 w-6 text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Gestión de Tickets</h3>
              <p className="text-gray-600">
                Organiza y responde tickets con facilidad. Asigna prioridades, estados y agentes.
              </p>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-sm hover:shadow-md transition">
              <div className="bg-primary-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <Users className="h-6 w-6 text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Web</h3>
              <p className="text-gray-600">
                Conectate desde cualquier lugar y en cualquier momento con nuestra interfaz web intuitiva.
              </p>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-sm hover:shadow-md transition">
              <div className="bg-primary-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <BarChart3 className="h-6 w-6 text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Analytics</h3>
              <p className="text-gray-600">
                Métricas en tiempo real sobre rendimiento del equipo y satisfacción del cliente.
              </p>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-sm hover:shadow-md transition">
              <div className="bg-primary-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <Shield className="h-6 w-6 text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Seguridad</h3>
              <p className="text-gray-600">
                Protección de datos y acceso basado en roles para tu tranquilidad.
              </p>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-sm hover:shadow-md transition">
              <div className="bg-primary-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <Zap className="h-6 w-6 text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Automatización</h3>
              <p className="text-gray-600">
                Reglas automáticas para asignar tickets y enviar respuestas predefinidas.
              </p>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-sm hover:shadow-md transition">
              <div className="bg-primary-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <Users className="h-6 w-6 text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Colaboración</h3>
              <p className="text-gray-600">
                Notas internas, menciones y trabajo en equipo para resolver tickets más rápido.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            ¿Listo para mejorar tu soporte?
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Únete a equipos que ya confían en Desk20 para gestionar su soporte técnico.
          </p>
          <Link 
            href="/register" 
            className="inline-block bg-primary-600 text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-primary-700 transition"
          >
            Comenzar Ahora
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <Headphones className="h-6 w-6 text-primary-600" />
              <span className="text-xl font-bold text-gray-900">Desk20</span>
            </div>
            <p className="text-gray-600">© 2025 Desk20. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
