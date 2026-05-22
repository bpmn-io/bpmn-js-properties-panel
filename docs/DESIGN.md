# Design

This document aims to lay out the way the properties panel works from the UX point of view - ensuring a predictable, simple and consistent experience for users configuring their BPMN elements, implementing Camunda solutions.

> [!NOTE]
> Supported and rooted in our [design principles](https://github.com/bpmn-io/design-principles/blob/main/README.md).

## Key traits

### Users can discover what sections do, without opening them

**Why:** [Empower the user][empower-the-user] to navigate and understand the provided feature set - learn about what you need and only care about that.

#### Supported by

* **Rule:** Sections have meaningful, semantic names
* **Rule:** Sections have tooltips that provide in-app guidance when you need it

### Users can learn which sections configure something, without opening them ("edits")

**Why:** Implementing a process [means different things][know-the-context] - _building_, _understanding_ or _changing_ a solution. Not every detail matters at any point, but understanding "where something is configured" is key to focus attention during all these activities.

#### Supported by

* **Rule:** The edited indicator shows per section when a section has *task implementation* deviating from the default values.

### Users control which sections are open - preserved across different elements

**Why:** Implementing a process is not a linear activity. Depending on your current goal / task you are [interested in different aspects of a solution][know-the-context] - looking holistically at the diagram, not only focusing on a single task:

  * "I am currently reviewing the process with my colleagues, including the documentation"
  * "I am currently implementing my process"

**Why:** My current viewing context is not limited to a single element, but the goal I have regarding my overall solution.

#### Supported by

* **Rule:** Properties panel section open state is _global_ state - [preserved across diagram navigation][know-the-context]. If a section is open in one element (i.e. documentation) and exists in another element, too, then it is also open when selecting the other element.

### Users can learn about how things work, when they need it

**Why:** The properties panel is complex due to the rich feature set that it needs to support. At all times, users have to have the chance to learn what individual parts do, and how they are relevant - if they don't know yet. We always have to assume that folks will at some point know. We cannot sacrifice expert experience with getting started experience.

#### Supported by

* **Rule:** Ensure sections and entries have semantic, meaningful names, backed by, i.e. Camunda documentation
* **Rule:** Focus on user configuration, not documentation
* **Rule:** Use tooltips for contextual help over description texts - ensuring documentation is always available, when needed, but never distracting when you know anyway
* **Rule:** When describing features, link to documentation - users are never blocked, can always learn more

### Built on simple, composable foundations

**Why:** Despite the intrinsic complexity of properties editing, users should feel at home - understand how the properties panel overall works, and use it.

#### Supported by

* **Rule:** Build on top of a limited set of core primitives - [less to learn][less-is-more], [less surprises][no-surprises].

### To FEEL or not to FEEL - just like Excel

**Why:** It is crucial for users to distinguish static configuration from dynamic (FEEL evaluation) - [whether the engine (or a third party component) evaluates something or not][editors-not-drawing-tools] must be obvious at all times.

#### Supported by

* **Rule:** We use `=` in front of any value to turn it into a FEEL expression - one thing, [easy to learn][less-is-more] with a [clear UI signal][no-surprises]
* **Rule:** Typing `=` into a FEEL enabled field turns it into a FEEL editor, [automatically][do-the-hard-work-to-make-it-simple]
* **Rule:** Typing `=` in a field that does not support FEEL evaluation treats it as a static string - [clearly distinguishable][no-surprises] from the field that "evaluates FEEL"

## See also

* [Our design principles](https://github.com/bpmn-io/design-principles/blob/main/README.md)

[editors-not-drawing-tools]: https://github.com/bpmn-io/design-principles?tab=readme-ov-file#editors-not-drawing-tools
[less-is-more]: https://github.com/bpmn-io/design-principles?tab=readme-ov-file#less-is-more
[no-surprises]: https://github.com/bpmn-io/design-principles?tab=readme-ov-file#no-surprises
[empower-the-user]: https://github.com/bpmn-io/design-principles?tab=readme-ov-file#empower-the-user
[know-the-context]: https://github.com/bpmn-io/design-principles?tab=readme-ov-file#know-the-context
[do-the-hard-work-to-make-it-simple]: https://github.com/bpmn-io/design-principles?tab=readme-ov-file#do-the-hard-work-to-make-it-simple