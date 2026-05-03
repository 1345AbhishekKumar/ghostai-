import { EditorLayout } from "@/components/editor/editor-layout"

export default function Home() {
  return (
    <EditorLayout>
      <section className="flex flex-1 items-center justify-center">
        <p className="text-sm text-muted-foreground">Canvas area</p>
      </section>
    </EditorLayout>
  )
}
