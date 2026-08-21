import { JSX } from 'react'
import { Task } from '@acme/domain'
import { PortalMark } from './PortalMark'
import { useStoneTheme } from './theme'
import { useNavigate } from '@stone-js/use-react-native'
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'

/**
 * What the task list looks like on a phone.
 *
 * The web application's page draws the same data with `div`, `ul` and `a`. This one uses `View`,
 * `ScrollView` and `Pressable`, and goes through `useNavigate` instead of an `href`: navigation is
 * the router's business either way, so a screen never renders another screen itself.
 *
 * @param props.tasks - The tasks to show.
 * @param props.remaining - How many are left.
 * @returns The screen.
 */
export function TaskListView ({ tasks, remaining }: { tasks: Task[], remaining: number }): JSX.Element {
  const theme = useStoneTheme()
  const navigate = useNavigate()

  return (
    <View style={[styles.screen, { backgroundColor: theme.ink }]}>
      <View style={[styles.glow, { backgroundColor: theme.inkGlow }]} pointerEvents='none' />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <PortalMark size={88} />

        <Text style={[styles.eyebrow, { color: theme.creamDim }]}>ONE DOMAIN, TWO APPS</Text>
        <Text style={[styles.title, { color: theme.ember2 }]}>Acme tasks</Text>
        <Text style={[styles.lead, { color: theme.cream }]}>{remaining} left to do</Text>

        <View style={styles.tasks}>
          {tasks.map((task) => (
            <Pressable
              key={task.id}
              accessibilityRole='button'
              accessibilityState={{ checked: task.done }}
              onPress={() => navigate(`/?toggle=${task.id}`, 'replace')}
              style={[styles.task, { borderColor: theme.line, backgroundColor: theme.card }]}
            >
              <Text style={[styles.box, { color: task.done ? theme.creamDim : theme.ember2 }]}>
                {task.done ? '●' : '○'}
              </Text>
              <Text style={[styles.taskTitle, { color: task.done ? theme.creamDim : theme.cream }]}>
                {task.title}
              </Text>
            </Pressable>
          ))}
        </View>

        <Text style={[styles.brand, { color: theme.creamDim }]}>
          <Text style={{ color: theme.ember2 }}>●</Text> the same{' '}
          <Text style={[styles.strong, { color: theme.ember1 }]}>@acme/domain</Text> runs the web app
        </Text>
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  screen: { flex: 1, overflow: 'hidden' },
  // The web app's ember glow, as the only shape a phone can draw it with.
  glow: {
    position: 'absolute',
    top: '2%',
    alignSelf: 'center',
    width: 380,
    height: 380,
    borderRadius: 190,
    opacity: 0.5
  },
  content: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 72
  },
  eyebrow: { marginTop: 20, fontSize: 11, fontWeight: '600', letterSpacing: 3 },
  title: { marginTop: 6, fontSize: 44, fontWeight: '800', letterSpacing: -1.4 },
  lead: { marginTop: 12, fontSize: 18, fontWeight: '600' },
  tasks: { marginTop: 26, width: '100%', maxWidth: 420, gap: 8 },
  task: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16
  },
  box: { fontSize: 13 },
  taskTitle: { flex: 1, fontSize: 16, fontWeight: '600' },
  strong: { fontWeight: '700' },
  brand: { marginTop: 32, fontSize: 13, textAlign: 'center' }
})
