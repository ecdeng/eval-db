"use client"

import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  useTest,
  useCreateTest,
  useUpdateTest,
  useCategories,
  useSubCategories,
  useToolTags,
  useTestSets,
} from "@/lib/api"
import { useToast } from "@/components/ui/toast"

const testFormSchema = z.object({
  prompt: z.string().min(1, "Prompt is required"),
  initialUrl: z.string().url("Invalid URL format"),
  golden: z.string().min(1, "Golden answer is required"),
  difficulty: z.enum(["simple", "complex"]),
  categoryId: z.string().min(1, "Category is required"),
  subCategoryId: z.string().min(1, "Sub-category is required"),
  toolTags: z.array(z.string()).default([]),
  testSets: z.array(z.string()).default([]),
})

type TestFormValues = z.infer<typeof testFormSchema>

interface TestFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  testId: string | null
}

export function TestForm({ open, onOpenChange, testId }: TestFormProps) {
  const { data: test } = useTest(testId)
  const { data: categories } = useCategories()
  const createTest = useCreateTest()
  const updateTest = useUpdateTest()
  const { addToast } = useToast()

  const form = useForm<TestFormValues>({
    resolver: zodResolver(testFormSchema),
    defaultValues: {
      prompt: "",
      initialUrl: "",
      golden: "",
      difficulty: "simple",
      categoryId: "",
      subCategoryId: "",
      toolTags: [],
      testSets: [],
    },
  })

  const selectedCategoryId = form.watch("categoryId")
  const { data: subCategories } = useSubCategories(selectedCategoryId)

  useEffect(() => {
    if (test && open) {
      form.reset({
        prompt: test.prompt,
        initialUrl: test.initialUrl,
        golden: test.golden,
        difficulty: test.difficulty,
        categoryId: test.categoryId,
        subCategoryId: test.subCategoryId,
        toolTags: test.toolTags,
        testSets: test.testSets,
      })
    } else if (!testId && open) {
      form.reset({
        prompt: "",
        initialUrl: "",
        golden: "",
        difficulty: "simple",
        categoryId: "",
        subCategoryId: "",
        toolTags: [],
        testSets: [],
      })
    }
  }, [test, testId, open, form])

  const onSubmit = async (values: TestFormValues) => {
    try {
      if (testId) {
        await updateTest.mutateAsync({ id: testId, data: values })
        addToast({
          title: "Test updated",
          description: "The test has been successfully updated",
          variant: "default",
        })
      } else {
        await createTest.mutateAsync(values)
        addToast({
          title: "Test created",
          description: "The test has been successfully created",
          variant: "default",
        })
      }
      onOpenChange(false)
      form.reset()
    } catch (error: any) {
      addToast({
        title: testId ? "Update failed" : "Create failed",
        description: error.message || "Failed to save test",
        variant: "destructive",
      })
    }
  }

  const { data: toolTags, isLoading: isLoadingToolTags } = useToolTags()
  const { data: testSets, isLoading: isLoadingTestSets } = useTestSets()

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {testId ? "Edit Test" : "Create New Test"}
          </DialogTitle>
          <DialogDescription>
            {testId
              ? "Update the test case details below."
              : "Fill in the details to create a new test case."}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="prompt"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Prompt</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter the instruction for the browser agent..."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="initialUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Initial URL</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="https://example.com"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    The starting point for the agent
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="golden"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Golden Answer</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Expected outcome or state description..."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="categoryId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select
                      onValueChange={(value) => {
                        field.onChange(value)
                        form.setValue("subCategoryId", "") // Reset subcategory
                      }}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {categories?.map((cat) => (
                          <SelectItem key={cat.id} value={cat.id}>
                            {cat.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="subCategoryId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sub-Category</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                      disabled={!selectedCategoryId}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select sub-category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {subCategories && subCategories.length > 0 ? (
                          subCategories.map((subCat) => (
                            <SelectItem key={subCat.id} value={subCat.id}>
                              {subCat.name}
                            </SelectItem>
                          ))
                        ) : (
                          <SelectItem value="" disabled>
                            No sub-categories available
                          </SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="difficulty"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Difficulty</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="simple">Simple</SelectItem>
                      <SelectItem value="complex">Complex</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="toolTags"
              render={() => (
                <FormItem>
                  <div className="mb-4">
                    <FormLabel className="text-base">Tool Tags</FormLabel>
                    <FormDescription>
                      Select the tools required for this test
                    </FormDescription>
                  </div>
                  <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto border rounded-md p-2">
                    {isLoadingToolTags ? (
                      <div className="col-span-2 p-4 text-sm text-muted-foreground text-center">
                        Loading tool tags...
                      </div>
                    ) : toolTags && toolTags.length > 0 ? (
                      toolTags.map((tag) => (
                      <FormField
                        key={tag}
                        control={form.control}
                        name="toolTags"
                        render={({ field }) => {
                          return (
                            <FormItem
                              key={tag}
                              className="flex flex-row items-start space-x-3 space-y-0"
                            >
                              <FormControl>
                                <Checkbox
                                  checked={field.value?.includes(tag)}
                                  onCheckedChange={(checked) => {
                                    return checked
                                      ? field.onChange([...field.value, tag])
                                      : field.onChange(
                                          field.value?.filter(
                                            (value) => value !== tag
                                          )
                                        )
                                  }}
                                />
                              </FormControl>
                              <FormLabel className="font-normal">
                                {tag}
                              </FormLabel>
                            </FormItem>
                          )
                        }}
                      />
                      ))
                    ) : (
                      <div className="col-span-2 p-4 text-sm text-muted-foreground text-center">
                        No tool tags available
                      </div>
                    )}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="testSets"
              render={() => (
                <FormItem>
                  <div className="mb-4">
                    <FormLabel className="text-base">Test Sets</FormLabel>
                    <FormDescription>
                      Select the test sets this test belongs to
                    </FormDescription>
                  </div>
                  <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto border rounded-md p-2">
                    {isLoadingTestSets ? (
                      <div className="col-span-2 p-4 text-sm text-muted-foreground text-center">
                        Loading test sets...
                      </div>
                    ) : testSets && testSets.length > 0 ? (
                      testSets.map((set) => (
                        <FormField
                          key={set}
                          control={form.control}
                          name="testSets"
                          render={({ field }) => {
                            return (
                              <FormItem
                                key={set}
                                className="flex flex-row items-start space-x-3 space-y-0"
                              >
                                <FormControl>
                                  <Checkbox
                                    checked={field.value?.includes(set)}
                                    onCheckedChange={(checked) => {
                                      return checked
                                        ? field.onChange([...field.value, set])
                                        : field.onChange(
                                            field.value?.filter(
                                              (value) => value !== set
                                            )
                                          )
                                    }}
                                  />
                                </FormControl>
                                <FormLabel className="font-normal">
                                  {set}
                                </FormLabel>
                              </FormItem>
                            )
                          }}
                        />
                      ))
                    ) : (
                      <div className="col-span-2 p-4 text-sm text-muted-foreground text-center">
                        No test sets available. Create some in Settings.
                      </div>
                    )}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit">
                {testId ? "Update" : "Create"} Test
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

