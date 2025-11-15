import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { TwoColumnPage } from '@/components/layout/TwoColumnPage';
import {
  AdminCourse,
  AdminSession,
  SessionPayload,
  cancelSession,
  createSession,
  getCourses,
  getSessions,
} from '@/api/admin';

const defaultSession: SessionPayload = {
  courseId: '',
  start: '',
  end: '',
  capacity: 10,
};

export const CoursesPage = () => {
  const queryClient = useQueryClient();
  const coursesQuery = useQuery<AdminCourse[]>({
    queryKey: ['admin', 'courses'],
    queryFn: getCourses,
  });

  const sessionsQuery = useQuery<AdminSession[]>({
    queryKey: ['admin', 'sessions'],
    queryFn: getSessions,
  });

  const [isSessionModalOpen, setIsSessionModalOpen] = useState(false);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [sessionForm, setSessionForm] = useState<SessionPayload>(defaultSession);
  const [sessionToCancel, setSessionToCancel] = useState<AdminSession | null>(null);

  const createSessionMutation = useMutation({
    mutationFn: createSession,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'sessions'] });
      setIsSessionModalOpen(false);
      setSessionForm(defaultSession);
    },
  });

  const cancelSessionMutation = useMutation({
    mutationFn: (sessionId: string) => cancelSession(sessionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'sessions'] });
      setIsCancelModalOpen(false);
    },
  });

  const upcomingSessions = useMemo(() => {
    if (!sessionsQuery.data) {
      return [];
    }
    return sessionsQuery.data
      .filter((session) => session.status === 'scheduled')
      .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());
  }, [sessionsQuery.data]);

  const noCourseAvailable = !coursesQuery.data || coursesQuery.data.length === 0;

  const openCreateSession = () => {
    setSessionForm({
      ...defaultSession,
      courseId: coursesQuery.data?.[0]?.id ?? '',
    });
    setIsSessionModalOpen(true);
  };

  const handleSessionSubmit = () => {
    if (!sessionForm.courseId) {
      return;
    }
    createSessionMutation.mutate(sessionForm);
  };

  const openCancelModal = (session: AdminSession) => {
    setSessionToCancel(session);
    setIsCancelModalOpen(true);
  };

  const confirmCancelSession = () => {
    if (!sessionToCancel) return;
    cancelSessionMutation.mutate(sessionToCancel.id);
  };

  const handleSessionFieldChange = (key: keyof SessionPayload, value: string | number) => {
    setSessionForm((prev) => ({
      ...prev,
      [key]: key === 'capacity' ? Number(value) : value,
    }));
  };

  return (
    <>
      <TwoColumnPage
        main={
          <>
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-semibold text-slate-900">Cours & sessions</h1>
                <p className="mt-1 text-sm text-slate-500">
                  Pilotez vos cours, ajustez les capacités et gérez les sessions à venir.
                </p>
              </div>
              <Button onClick={openCreateSession} disabled={noCourseAvailable}>
                Programmer une session
              </Button>
            </div>

            <Card>
              <h2 className="text-lg font-semibold text-slate-900">Cours disponibles</h2>
              <p className="mt-1 text-sm text-slate-500">
                Liste des cours actifs et de leur capacité par défaut.
              </p>
              <div className="mt-4 grid gap-3 md:grid-cols-2">
                {coursesQuery.isLoading ? (
                  <div className="col-span-2 text-sm text-slate-400">Chargement des cours...</div>
                ) : coursesQuery.data && coursesQuery.data.length > 0 ? (
                  coursesQuery.data.map((course) => (
                    <div
                      key={course.id}
                      className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
                    >
                      <p className="text-base font-semibold text-slate-900">{course.name}</p>
                      <p className="text-sm text-slate-500">Coach : {course.coach}</p>
                      <p className="text-sm text-slate-500">Catégorie : {course.category}</p>
                      <div className="mt-3 flex items-center justify-between text-sm">
                        <span className="text-slate-500">Capacité standard</span>
                        <span className="font-medium text-slate-900">{course.capacity} pers.</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="col-span-2 text-sm text-slate-400">
                    Aucun cours configuré pour le moment.
                  </div>
                )}
              </div>
            </Card>

            <Card>
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">Sessions programmées</h2>
                  <p className="text-sm text-slate-500">
                    Visualisez les sessions à venir et annulez celles qui ne peuvent être maintenues.
                  </p>
                </div>
                <Button variant="ghost" size="sm" onClick={() => sessionsQuery.refetch()}>
                  Actualiser
                </Button>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200 text-sm">
                  <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
                    <tr>
                      <th className="px-4 py-3 font-medium">Cours</th>
                      <th className="px-4 py-3 font-medium">Début</th>
                      <th className="px-4 py-3 font-medium">Fin</th>
                      <th className="px-4 py-3 font-medium">Inscrits</th>
                      <th className="px-4 py-3 font-medium">Capacité</th>
                      <th className="px-4 py-3 font-medium">Remplissage</th>
                      <th className="px-4 py-3 font-medium text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {sessionsQuery.isLoading ? (
                      <tr>
                        <td colSpan={7} className="px-4 py-6 text-center text-slate-400">
                          Chargement des sessions...
                        </td>
                      </tr>
                    ) : upcomingSessions.length > 0 ? (
                      upcomingSessions.map((session) => {
                        const occupancy = session.capacity
                          ? Math.round((session.enrolled / session.capacity) * 100)
                          : 0;
                        const course = coursesQuery.data?.find((item) => item.id === session.courseId);
                        return (
                          <tr key={session.id} className="hover:bg-slate-50">
                            <td className="px-4 py-3 font-medium text-slate-900">{course?.name ?? 'Cours supprimé'}</td>
                            <td className="px-4 py-3 text-slate-600">
                              {format(new Date(session.start), "EEE d MMM HH'h'mm", { locale: fr })}
                            </td>
                            <td className="px-4 py-3 text-slate-600">
                              {format(new Date(session.end), "EEE d MMM HH'h'mm", { locale: fr })}
                            </td>
                            <td className="px-4 py-3 text-slate-600">{session.enrolled}</td>
                            <td className="px-4 py-3 text-slate-600">{session.capacity}</td>
                            <td className="px-4 py-3">
                              <span
                                className="inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold"
                                style={{
                                  backgroundColor: occupancy >= 85 ? 'rgba(67, 56, 202, 0.12)' : 'rgba(2, 132, 199, 0.12)',
                                  color: occupancy >= 85 ? '#4338CA' : '#0C4A6E',
                                }}
                              >
                                {occupancy}%
                              </span>
                            </td>
                            <td className="px-4 py-3 text-right">
                              <Button size="sm" variant="ghost" onClick={() => openCancelModal(session)}>
                                Annuler
                              </Button>
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan={7} className="px-4 py-6 text-center text-slate-400">
                          Aucune session programmée n’a été trouvée.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </Card>
          </>
        }
        sidebar={
          <>
            <Card>
              <h3 className="text-base font-semibold text-slate-900">Bonnes pratiques calendrier</h3>
              <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-slate-600">
                <li>Ouvrez les réservations au minimum 2 semaines à l’avance.</li>
                <li>Gardez une marge de 15 minutes entre deux sessions successives.</li>
                <li>Réduisez la capacité sur les créneaux de faible affluence pour renforcer l’exclusivité.</li>
              </ul>
            </Card>
            <Card>
              <h3 className="text-base font-semibold text-slate-900">Suivi des annulations</h3>
              <p className="mt-2 text-sm text-slate-500">
                Anticipez les annulations et communiquez rapidement auprès des membres concernés.
              </p>
              <div className="mt-3 rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm text-slate-600">
                Maintenez un taux d’annulation inférieur à 5% pour garantir une expérience premium.
              </div>
            </Card>
          </>
        }
      />

      <Modal
        isOpen={isSessionModalOpen}
        onClose={() => setIsSessionModalOpen(false)}
        title="Programmer une session"
        confirmLabel="Enregistrer"
        onConfirm={handleSessionSubmit}
        confirmLoading={createSessionMutation.isPending}
      >
        <div className="flex flex-col space-y-1">
          <label className="text-sm font-medium text-slate-700">Cours</label>
          {noCourseAvailable ? (
            <p className="rounded-lg border border-dashed border-slate-300 bg-slate-50 px-3 py-2 text-sm text-slate-500">
              Aucun cours n’est disponible. Créez d’abord un cours dans le back-office API.
            </p>
          ) : (
            <select
              className="rounded-lg border border-slate-200 px-3 py-2 text-sm shadow-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200"
              value={sessionForm.courseId}
              onChange={(event) => handleSessionFieldChange('courseId', event.target.value)}
            >
              {coursesQuery.data?.map((course) => (
                <option key={course.id} value={course.id}>
                  {course.name}
                </option>
              ))}
            </select>
          )}
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="Début"
            type="datetime-local"
            value={sessionForm.start}
            onChange={(event) => handleSessionFieldChange('start', event.target.value)}
            required
          />
          <Input
            label="Fin"
            type="datetime-local"
            value={sessionForm.end}
            onChange={(event) => handleSessionFieldChange('end', event.target.value)}
            required
          />
        </div>
        <Input
          label="Capacité"
          type="number"
          min={1}
          value={sessionForm.capacity}
          onChange={(event) => handleSessionFieldChange('capacity', event.target.value)}
        />
      </Modal>

      <Modal
        isOpen={isCancelModalOpen}
        onClose={() => setIsCancelModalOpen(false)}
        title="Annuler la session"
        description="Prévenez les membres concernés par notification et proposez un report."
        confirmLabel="Annuler la session"
        onConfirm={confirmCancelSession}
        confirmLoading={cancelSessionMutation.isPending}
      >
        <p className="text-sm text-slate-600">
          Confirmez-vous l’annulation du cours{' '}
          <span className="font-semibold text-slate-900">
            {coursesQuery.data?.find((course) => course.id === sessionToCancel?.courseId)?.name}
          </span>{' '}
          prévu le{' '}
          {sessionToCancel
            ? format(new Date(sessionToCancel.start), "EEEE d MMMM 'à' HH'h'mm", { locale: fr })
            : ''}
          ?
        </p>
      </Modal>
    </>
  );
};
