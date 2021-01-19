# RELEASE CHECKLIST

```markdown
* [ ] make sure changes in upstream libraries are merged and released
    * `bpmn-js`, `diagram-js`, `*-moddle`
* [ ] make sure dependencies to upstream libraries are updated and can be installed (`rm -rf node_modules && npm i && npm run all` works)
* [ ] update CHANGELOG
* [ ] perform integration test locally using [properties-panel example](https://github.com/bpmn-io/bpmn-js-examples/tree/master/properties-panel)
* [ ] perform semantic release
* [ ] (if appropriate) write blog post
* [ ] (if appropriate) spread the word
```
